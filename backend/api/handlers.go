package api

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sensejourney/backend/config"
	"github.com/sensejourney/backend/models"
	"gorm.io/gorm"
)

// LoginRequest 登录请求结构
type LoginRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest 注册请求结构
type RegisterRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Email    string `json:"email" binding:"omitempty,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// Login 处理登录请求
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 根据输入值判断是邮箱还是手机号
	var user *models.User
	var err error

	// 简单判断：包含@符号的是邮箱
	if strings.Contains(req.Phone, "@") {
		// 根据邮箱查找用户
		user, err = models.FindByEmail(config.DB, req.Phone)
	} else {
		// 根据手机号查找用户
		user, err = models.FindByPhone(config.DB, req.Phone)
	}

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// 校验密码
	if !user.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	// 登录成功
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":    user.ID,
			"phone": user.Phone,
			"email": user.Email,
		},
	})
}

// Register 处理注册请求
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 检查用户是否已存在
	existingUser, err := models.FindByPhone(config.DB, req.Phone)
	if err == nil && existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// 创建新用户
	user := &models.User{
		Phone: req.Phone,
		Email: req.Email,
	}

	// 设置密码
	if err := user.SetPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set password"})
		return
	}

	// 保存用户
	if err := user.Save(config.DB); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// 注册成功
	c.JSON(http.StatusCreated, gin.H{
		"message": "Registration successful",
		"user": gin.H{
			"id":    user.ID,
			"phone": user.Phone,
			"email": user.Email,
		},
	})
}

// GetUserByPhone 根据手机号获取用户信息
func GetUserByPhone(c *gin.Context) {
	phone := c.Param("phone")

	user, err := models.FindByPhone(config.DB, phone)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":    user.ID,
			"phone": user.Phone,
			"email": user.Email,
		},
	})
}
