package main

import (
	"encoding/binary"

	"github.com/google/uuid"
	hashids "github.com/speps/go-hashids/v2"
)

const (
	salt      = "salt_for_sensejourney"
	minLength = 8
)

func encodeUUIDToHashid(uuidStr string) (string, error) {
	// 解析UUID
	u, err := uuid.Parse(uuidStr)
	if err != nil {
		return "", err
	}

	// 将UUID字节转换为两个uint64数字
	bytes := u[:]
	firstPart := binary.BigEndian.Uint64(bytes[:8])
	secondPart := binary.BigEndian.Uint64(bytes[8:])

	// 配置Hashids
	hd := hashids.NewData()
	hd.Salt = salt
	hd.MinLength = minLength

	h, err := hashids.NewWithData(hd)
	if err != nil {
		return "", err
	}

	// 编码两个数字
	hash, err := h.EncodeInt64([]int64{int64(firstPart), int64(secondPart)})
	if err != nil {
		return "", err
	}

	return hash, nil
}
