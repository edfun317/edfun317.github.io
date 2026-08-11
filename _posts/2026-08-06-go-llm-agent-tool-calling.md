---
layout: post
title: 用 Go 打造一個最小可行的 AI Agent：從 LLM API 到 Tool Calling Loop
date: 2026-08-06 10:00:00 +0800
description: 記錄用 Go 串接 LLM API、實作 tool calling 迴圈，打造一個能自己決定要不要呼叫工具的小型 Agent 的過程
tags: golang ai-agent llm tool-calling
categories: ai
---

## 為什麼想自己動手做

市面上的 Agent 框架（LangChain、各家 SDK）功能很完整，但對後端工程師來說，直接用熟悉的語言把 Agent 的核心迴圈手刻一次，會更清楚「Agent 到底在做什麼」——說穿了就是一個會呼叫外部函式的 LLM 對話迴圈。這篇記錄我用 Go 從零打造一個最小可行 Agent 的過程，重點放在 tool calling 迴圈本身，不引入額外框架。

## 最小可行 Agent 的組成

一個能用的 Agent，最少需要三個部分：

1. **LLM Client**：負責跟模型 API 溝通，送出訊息歷史與可用工具清單，拿回回覆
2. **Tool Registry**：定義 Agent 能呼叫的函式，包含名稱、參數 schema、實際執行邏輯
3. **Agent Loop**：反覆執行「送出對話 → 檢查是否要呼叫工具 → 執行工具 → 把結果塞回對話」直到模型給出最終答案

## 定義 Tool

工具的介面設計是關鍵，我用一個簡單的 interface 讓每個工具自己描述 schema 跟執行邏輯：

```go
type Tool interface {
    Name() string
    Description() string
    Schema() map[string]any // JSON Schema，給模型看的參數格式
    Execute(ctx context.Context, args json.RawMessage) (string, error)
}

type WeatherTool struct{}

func (t *WeatherTool) Name() string        { return "get_weather" }
func (t *WeatherTool) Description() string { return "查詢指定城市的目前天氣" }
func (t *WeatherTool) Schema() map[string]any {
    return map[string]any{
        "type": "object",
        "properties": map[string]any{
            "city": map[string]any{"type": "string", "description": "城市名稱"},
        },
        "required": []string{"city"},
    }
}

func (t *WeatherTool) Execute(ctx context.Context, args json.RawMessage) (string, error) {
    var input struct{ City string `json:"city"` }
    if err := json.Unmarshal(args, &input); err != nil {
        return "", fmt.Errorf("invalid arguments: %w", err)
    }
    // 這裡實際上會呼叫氣象 API，先用假資料示意
    return fmt.Sprintf("%s 目前氣溫 28°C，晴時多雲", input.City), nil
}
```

## Agent Loop：觀察—決策—行動

核心迴圈的邏輯很直白：把工具清單跟目前的對話歷史送給模型，如果回應裡有 `tool_calls`，就在本地執行對應的工具、把結果當成新的一則訊息塞回對話，再送一次給模型；直到模型不再要求呼叫工具為止。

```go
func (a *Agent) Run(ctx context.Context, userInput string) (string, error) {
    a.history = append(a.history, Message{Role: "user", Content: userInput})

    const maxIterations = 6 // 防止工具呼叫陷入無限迴圈
    for i := 0; i < maxIterations; i++ {
        resp, err := a.client.ChatCompletion(ctx, ChatRequest{
            Messages: a.history,
            Tools:    a.toolSchemas(),
        })
        if err != nil {
            return "", fmt.Errorf("llm call failed: %w", err)
        }

        msg := resp.Choices[0].Message
        a.history = append(a.history, msg)

        if len(msg.ToolCalls) == 0 {
            return msg.Content, nil // 模型給出最終回答，結束迴圈
        }

        for _, call := range msg.ToolCalls {
            result, err := a.executeTool(ctx, call)
            if err != nil {
                result = fmt.Sprintf("error: %v", err) // 把錯誤也回饋給模型，讓它自己決定怎麼處理
            }
            a.history = append(a.history, Message{
                Role:       "tool",
                ToolCallID: call.ID,
                Content:    result,
            })
        }
    }
    return "", fmt.Errorf("exceeded max iterations without a final answer")
}

func (a *Agent) executeTool(ctx context.Context, call ToolCall) (string, error) {
    tool, ok := a.tools[call.Function.Name]
    if !ok {
        return "", fmt.Errorf("unknown tool: %s", call.Function.Name)
    }
    return tool.Execute(ctx, call.Function.Arguments)
}
```

值得注意的幾個設計：

- **`maxIterations` 上限**：模型偶爾會陷入反覆呼叫同一個工具的迴圈（尤其是工具回傳格式不符預期時），一定要有硬上限擋住，不然會一路燒 token
- **工具執行錯誤不是致命錯誤**：把 error 訊息也當成一則 `tool` 訊息塞回對話，讓模型自己看到失敗原因並調整下一步，而不是直接讓整個 Agent 掛掉
- **`ToolCallID` 要對得上**：多數 LLM API 要求 tool 回應訊息帶上對應的 `tool_call_id`，如果模型一次要求呼叫多個工具，順序或 ID 對不上會讓下一輪請求直接被 API 拒絕

## 組裝起來

```go
func main() {
    agent := NewAgent(NewLLMClient(os.Getenv("LLM_API_KEY")))
    agent.RegisterTool(&WeatherTool{})

    answer, err := agent.Run(context.Background(), "台北現在天氣如何？")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(answer)
}
```

跑起來的流程大致是：使用者問天氣 → 模型判斷需要呼叫 `get_weather` → Agent 執行工具拿到結果 → 把結果餵回模型 → 模型組出最終的自然語言回答。

## 踩過的坑

- **參數 JSON 解析要防呆**：模型偶爾會產生格式不完全正確的參數（少了引號、多了逗號），`Execute` 裡的 `Unmarshal` 一定要處理錯誤，不能假設輸入永遠合法
- **對話歷史會爆長**：工具呼叫越多輪，`history` 累積得越快，超過 context window 就會被截斷或報錯。實務上要做歷史裁剪或摘要，這篇先用 `maxIterations` 頂著，之後有空會另外寫一篇處理長對話管理
- **平行工具呼叫**：模型有時會在同一輪回應多個 `tool_calls`，如果工具之間沒有相依性，可以平行執行縮短總延遲，這點目前的實作還是序列跑，是下一步想優化的地方

## 心得

手刻一次之後最大的體會是：Agent 框架幫你處理的「魔法」，拆開來看其實就是這個迴圈加上一堆防呆。對後端工程師來說，理解這個迴圈比直接套框架更有幫助——遇到問題時才知道該往哪裡查。
