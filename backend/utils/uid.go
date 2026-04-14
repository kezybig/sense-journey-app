package utils

import (
	"sync/atomic"
	"time"
)

// UIDGenerator UID生成器
type UIDGenerator struct {
	machineID uint64
	sequence  uint64
	lastTime  uint64
}

// NewUIDGenerator 创建新的UID生成器
func NewUIDGenerator(machineID uint64) *UIDGenerator {
	if machineID > 0xFFF { // 12位机器ID最大4095
		machineID = 0
	}
	return &UIDGenerator{
		machineID: machineID,
		sequence:  0,
		lastTime:  0,
	}
}

// Generate 生成新的UID (uint64)
func (g *UIDGenerator) Generate() uint64 {
	// 时间戳（5分钟块，从2024-01-01开始）
	epoch := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	now := uint64(time.Since(epoch).Minutes() / 5) // 每5分钟一个块

	// 序列号
	seq := atomic.AddUint64(&g.sequence, 1)

	// 如果时间回退，使用最后的时间
	if now < g.lastTime {
		now = g.lastTime
	}

	// 如果时间相同，增加序列号
	if now == g.lastTime {
		if seq >= 0x7FF { // 11位序列号最大2047
			// 等待下一个5分钟块
			for now <= g.lastTime {
				time.Sleep(100 * time.Millisecond)
				now = uint64(time.Since(epoch).Minutes() / 5)
			}
			atomic.StoreUint64(&g.sequence, 0)
			seq = 0
		}
	} else {
		atomic.StoreUint64(&g.sequence, 0)
		seq = 0
	}

	g.lastTime = now

	// 组装UID: 时间戳(41位) | 机器ID(12位) | 序列号(11位)
	uid := (now << 23) | (g.machineID << 11) | (seq & 0x7FF)
	return uid
}

// 默认UID生成器实例
var defaultUIDGenerator = NewUIDGenerator(0)

// GenerateUID 生成新的UID (使用默认生成器)
func GenerateUID() uint64 {
	return defaultUIDGenerator.Generate()
}
