package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sensejourney/backend/api"
	"github.com/sensejourney/backend/config"
)

func main() {
	// 初始化数据库
	config.InitDatabase()

	// 创建Gin引擎
	r := gin.Default()

	// 跨域中间件
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 静态前端应用 - 从web-build目录提供静态文件
	r.Static("/app", "./web-build")
	// 重定向 /app 到 /app/
	r.GET("/app", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/app/")
	})

	// 路由设置
	apiGroup := r.Group("/api")
	{
		apiGroup.POST("/login", api.Login)
		apiGroup.POST("/register", api.Register)
		apiGroup.GET("/user/:phone", api.GetUserByPhone)

		// 旅程选择相关接口
		apiGroup.POST("/journey-selections", api.CreateJourneySelection)
		apiGroup.GET("/journey-selections/user/:uid", api.GetJourneySelectionsByUID)
		apiGroup.GET("/journey-selections/latest/:uid", api.GetLatestJourneySelectionByUID)
		apiGroup.DELETE("/journey-selections/:id", api.DeleteJourneySelection)
		apiGroup.PUT("/journey-selections/:id/status", api.UpdateJourneySelectionStatus)
	}

	// 根路由 - 提供前端应用入口
	r.GET("/", func(c *gin.Context) {
		html := `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SenseJourney - 情感探索之旅</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 800px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #00ced1, #00bfff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .status {
            background: rgba(0, 206, 209, 0.2);
            border: 2px solid #00ced1;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
            text-align: left;
        }
        .status h3 {
            color: #00ced1;
            margin-top: 0;
        }
        .button {
            background: linear-gradient(90deg, #00ced1, #00bfff);
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.2rem;
            border-radius: 50px;
            cursor: pointer;
            margin: 10px;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 206, 209, 0.3);
        }
        .api-info {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            font-family: monospace;
            font-size: 0.9rem;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 SenseJourney</h1>
        <p>情感探索之旅 - 实时情感雷达与交互控制台</p>
        
        <div class="status">
            <h3>📡 系统状态</h3>
            <p>✅ 后端API服务运行正常 (端口: 8080)</p>
            <p>🔗 API端点: <code>/api/login</code>, <code>/api/register</code>, <code>/api/user/:phone</code></p>
            <p>🌐 前端应用可通过以下方式访问：</p>
        </div>
        
        <div>
            <a href="/app/" class="button">🚀 启动应用 (通过代理)</a>
            <a href="/" class="button">🔄 刷新此页面</a>
            <a href="http://192.168.200.185:8082" class="button">📱 局域网访问 (同一网络)</a>
            <a href="https://github.com/kezybig/sense-journey-app" class="button">💾 GitHub 仓库</a>
        </div>
        
        <div class="api-info">
            <strong>API测试:</strong><br>
            curl -X POST https://gradient-criteria-cheddar.ngrok-free.dev/api/login \<br>
            -H "Content-Type: application/json" \<br>
            -d '{"phone":"test","password":"test"}'
        </div>
        
        <p style="margin-top: 30px; font-size: 0.9rem; opacity: 0.8;">
            前端应用可通过 <strong><a href="/app/" style="color: #00ced1; text-decoration: underline;">/app/</a></strong> 路径访问<br>
            此路径代理到端口8082的Expo开发服务器，提供完整交互功能
        </p>
    </div>
</body>
</html>`
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(200, html)
	})

	// 启动服务器
	port := 8080
	fmt.Printf("Server running on http://localhost:%d\n", port)
	r.Run(fmt.Sprintf(":%d", port))
}
