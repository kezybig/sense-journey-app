package utils

import (
	"errors"

	hashids "github.com/speps/go-hashids/v2"
)

const (
	salt      = "salt_for_sensejourney"
	minLength = 8
)

var (
	ErrInvalidHashid = errors.New("invalid hashid")
)

// EncodeUIDToHashid 将UID (uint64) 编码为Hashid字符串
func EncodeUIDToHashid(uid uint64) (string, error) {
	// 将uint64拆分为两个uint32数字
	high := uint32(uid >> 32)
	low := uint32(uid & 0xFFFFFFFF)

	// 配置Hashids
	hd := hashids.NewData()
	hd.Salt = salt
	hd.MinLength = minLength

	h, err := hashids.NewWithData(hd)
	if err != nil {
		return "", err
	}

	// 编码两个数字
	hash, err := h.EncodeInt64([]int64{
		int64(high),
		int64(low),
	})
	if err != nil {
		return "", err
	}

	return hash, nil
}

// DecodeHashidToUID 将Hashid字符串解码为UID (uint64)
func DecodeHashidToUID(hash string) (uint64, error) {
	// 配置Hashids
	hd := hashids.NewData()
	hd.Salt = salt
	hd.MinLength = minLength

	h, err := hashids.NewWithData(hd)
	if err != nil {
		return 0, err
	}

	// 解码Hashid
	numbers, err := h.DecodeInt64WithError(hash)
	if err != nil {
		return 0, err
	}

	if len(numbers) != 2 {
		return 0, ErrInvalidHashid
	}

	// 将两个uint32组合回uint64
	high := uint64(uint32(numbers[0]))
	low := uint64(uint32(numbers[1]))
	uid := (high << 32) | low

	return uid, nil
}