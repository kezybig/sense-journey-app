package main

import (
	"fmt"

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

	// 路由设置
	apiGroup := r.Group("/api")
	{
		apiGroup.POST("/login", api.Login)
		apiGroup.POST("/register", api.Register)
		apiGroup.GET("/user/:phone", api.GetUserByPhone)
	}

	// 启动服务器
	port := 8080
	fmt.Printf("Server running on http://localhost:%d\n", port)
	r.Run(fmt.Sprintf(":%d", port))
}
