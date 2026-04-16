package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

// Duration 持续时间枚举 (数据库存储int，API传输string)
type Duration int

const (
	Duration1To2  Duration = iota + 1 // 1-2天
	Duration3To5                      // 3-5天
	Duration5To7                      // 5-7天
	Duration7Plus                     // 7天以上
)

// String 返回持续时间的字符串表示
func (d Duration) String() string {
	switch d {
	case Duration1To2:
		return "1-2"
	case Duration3To5:
		return "3-5"
	case Duration5To7:
		return "5-7"
	case Duration7Plus:
		return "7+"
	default:
		return ""
	}
}

// MarshalJSON 实现JSON序列化
func (d Duration) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.String())
}

// UnmarshalJSON 实现JSON反序列化
func (d *Duration) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	switch s {
	case "1-2":
		*d = Duration1To2
	case "3-5":
		*d = Duration3To5
	case "5-7":
		*d = Duration5To7
	case "7+":
		*d = Duration7Plus
	default:
		return errors.New("invalid duration value")
	}
	return nil
}

// FromString 从字符串创建Duration
func DurationFromString(s string) (Duration, error) {
	switch s {
	case "1-2":
		return Duration1To2, nil
	case "3-5":
		return Duration3To5, nil
	case "5-7":
		return Duration5To7, nil
	case "7+":
		return Duration7Plus, nil
	default:
		return 0, errors.New("invalid duration value")
	}
}

// IsValidDuration 检查是否为有效的持续时间
func IsValidDuration(d string) bool {
	switch d {
	case "1-2", "3-5", "5-7", "7+":
		return true
	default:
		return false
	}
}

// AllDurations 返回所有持续时间选项
func AllDurations() []Duration {
	return []Duration{
		Duration1To2,
		Duration3To5,
		Duration5To7,
		Duration7Plus,
	}
}

// Proximity 距离范围枚举 (数据库存储int，API传输string)
type Proximity int

const (
	Proximity1To3H  Proximity = iota + 1 // 1-3小时
	Proximity3To5H                       // 3-5小时
	Proximity5To7H                       // 5-7小时
	Proximity7PlusH                      // 7小时以上
)

// String 返回距离范围的字符串表示
func (p Proximity) String() string {
	switch p {
	case Proximity1To3H:
		return "1-3H"
	case Proximity3To5H:
		return "3-5H"
	case Proximity5To7H:
		return "5-7H"
	case Proximity7PlusH:
		return "7+H"
	default:
		return ""
	}
}

// MarshalJSON 实现JSON序列化
func (p Proximity) MarshalJSON() ([]byte, error) {
	return json.Marshal(p.String())
}

// UnmarshalJSON 实现JSON反序列化
func (p *Proximity) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	switch s {
	case "1-3H":
		*p = Proximity1To3H
	case "3-5H":
		*p = Proximity3To5H
	case "5-7H":
		*p = Proximity5To7H
	case "7+H":
		*p = Proximity7PlusH
	default:
		return errors.New("invalid proximity value")
	}
	return nil
}

// FromString 从字符串创建Proximity
func ProximityFromString(s string) (Proximity, error) {
	switch s {
	case "1-3H":
		return Proximity1To3H, nil
	case "3-5H":
		return Proximity3To5H, nil
	case "5-7H":
		return Proximity5To7H, nil
	case "7+H":
		return Proximity7PlusH, nil
	default:
		return 0, errors.New("invalid proximity value")
	}
}

// IsValidProximity 检查是否为有效的距离范围
func IsValidProximity(p string) bool {
	switch p {
	case "1-3H", "3-5H", "5-7H", "7+H":
		return true
	default:
		return false
	}
}

// AllProximities 返回所有距离范围选项
func AllProximities() []Proximity {
	return []Proximity{
		Proximity1To3H,
		Proximity3To5H,
		Proximity5To7H,
		Proximity7PlusH,
	}
}

// Transport 交通方式枚举 (数据库存储int，API传输string)
type Transport int

const (
	TransportPublic    Transport = iota + 1 // 公共交通
	TransportSelfDrive                      // 自驾
	TransportHighSpeed                      // 高铁
	TransportAirplane                       // 飞机
)

// String 返回交通方式的字符串表示
func (t Transport) String() string {
	switch t {
	case TransportPublic:
		return "公共交通"
	case TransportSelfDrive:
		return "自驾"
	case TransportHighSpeed:
		return "高铁"
	case TransportAirplane:
		return "飞机"
	default:
		return ""
	}
}

// MarshalJSON 实现JSON序列化
func (t Transport) MarshalJSON() ([]byte, error) {
	return json.Marshal(t.String())
}

// UnmarshalJSON 实现JSON反序列化
func (t *Transport) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	switch s {
	case "公共交通":
		*t = TransportPublic
	case "自驾":
		*t = TransportSelfDrive
	case "高铁":
		*t = TransportHighSpeed
	case "飞机":
		*t = TransportAirplane
	default:
		return errors.New("invalid transport value")
	}
	return nil
}

// FromString 从字符串创建Transport
func TransportFromString(s string) (Transport, error) {
	switch s {
	case "公共交通":
		return TransportPublic, nil
	case "自驾":
		return TransportSelfDrive, nil
	case "高铁":
		return TransportHighSpeed, nil
	case "飞机":
		return TransportAirplane, nil
	default:
		return 0, errors.New("invalid transport value")
	}
}

// IsValidTransport 检查是否为有效的交通方式
func IsValidTransport(t string) bool {
	switch t {
	case "公共交通", "自驾", "高铁", "飞机":
		return true
	default:
		return false
	}
}

// AllTransports 返回所有交通方式选项
func AllTransports() []Transport {
	return []Transport{
		TransportPublic,
		TransportSelfDrive,
		TransportHighSpeed,
		TransportAirplane,
	}
}

// Mood 情绪标签枚举 (数据库存储int，API传输string)
type Mood int

const (
	MoodQuietAlone Mood = iota + 1 // 安静独处
	MoodExercise                   // 运动释放
	MoodNeedGreen                  // 需要绿色
	MoodWantDrink                  // 想喝一杯
	MoodAdventure                  // 冒险探索
)

// String 返回情绪标签的字符串表示
func (m Mood) String() string {
	switch m {
	case MoodQuietAlone:
		return "安静独处"
	case MoodExercise:
		return "运动释放"
	case MoodNeedGreen:
		return "需要绿色"
	case MoodWantDrink:
		return "想喝一杯"
	case MoodAdventure:
		return "冒险探索"
	default:
		return ""
	}
}

// MarshalJSON 实现JSON序列化
func (m Mood) MarshalJSON() ([]byte, error) {
	return json.Marshal(m.String())
}

// UnmarshalJSON 实现JSON反序列化
func (m *Mood) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	switch s {
	case "安静独处":
		*m = MoodQuietAlone
	case "运动释放":
		*m = MoodExercise
	case "需要绿色":
		*m = MoodNeedGreen
	case "想喝一杯":
		*m = MoodWantDrink
	case "冒险探索":
		*m = MoodAdventure
	default:
		return errors.New("invalid mood value")
	}
	return nil
}

// FromString 从字符串创建Mood
func MoodFromString(s string) (Mood, error) {
	switch s {
	case "安静独处":
		return MoodQuietAlone, nil
	case "运动释放":
		return MoodExercise, nil
	case "需要绿色":
		return MoodNeedGreen, nil
	case "想喝一杯":
		return MoodWantDrink, nil
	case "冒险探索":
		return MoodAdventure, nil
	default:
		return 0, errors.New("invalid mood value")
	}
}

// IsValidMood 检查是否为有效的情绪标签
func IsValidMood(m string) bool {
	switch m {
	case "安静独处", "运动释放", "需要绿色", "想喝一杯", "冒险探索":
		return true
	default:
		return false
	}
}

// AllMoods 返回所有情绪标签选项
func AllMoods() []Mood {
	return []Mood{
		MoodQuietAlone,
		MoodExercise,
		MoodNeedGreen,
		MoodWantDrink,
		MoodAdventure,
	}
}

// Budget 预算枚举 (数据库存储int，API传输string)
type Budget int

const (
	Budget0        Budget = iota + 1 // 0元
	Budget500                        // 500元
	Budget1000                       // 1000元
	Budget1500                       // 1500元
	Budget2000                       // 2000元
	Budget2500                       // 2500元
	Budget3000                       // 3000元
	Budget3000Plus                   // 3000元以上
)

// String 返回预算的字符串表示
func (b Budget) String() string {
	switch b {
	case Budget0:
		return "0"
	case Budget500:
		return "500"
	case Budget1000:
		return "1000"
	case Budget1500:
		return "1500"
	case Budget2000:
		return "2000"
	case Budget2500:
		return "2500"
	case Budget3000:
		return "3000"
	case Budget3000Plus:
		return "3000+"
	default:
		return ""
	}
}

// MarshalJSON 实现JSON序列化
func (b Budget) MarshalJSON() ([]byte, error) {
	return json.Marshal(b.String())
}

// UnmarshalJSON 实现JSON反序列化
func (b *Budget) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	switch s {
	case "0":
		*b = Budget0
	case "500":
		*b = Budget500
	case "1000":
		*b = Budget1000
	case "1500":
		*b = Budget1500
	case "2000":
		*b = Budget2000
	case "2500":
		*b = Budget2500
	case "3000":
		*b = Budget3000
	case "3000+":
		*b = Budget3000Plus
	default:
		return errors.New("invalid budget value")
	}
	return nil
}

// FromString 从字符串创建Budget
func BudgetFromString(s string) (Budget, error) {
	switch s {
	case "0":
		return Budget0, nil
	case "500":
		return Budget500, nil
	case "1000":
		return Budget1000, nil
	case "1500":
		return Budget1500, nil
	case "2000":
		return Budget2000, nil
	case "2500":
		return Budget2500, nil
	case "3000":
		return Budget3000, nil
	case "3000+":
		return Budget3000Plus, nil
	default:
		return 0, errors.New("invalid budget value")
	}
}

// IsValidBudget 检查是否为有效的预算值
func IsValidBudget(b string) bool {
	switch b {
	case "0", "500", "1000", "1500", "2000", "2500", "3000", "3000+":
		return true
	default:
		return false
	}
}

// AllBudgets 返回所有预算选项
func AllBudgets() []Budget {
	return []Budget{
		Budget0,
		Budget500,
		Budget1000,
		Budget1500,
		Budget2000,
		Budget2500,
		Budget3000,
		Budget3000Plus,
	}
}

// MoodList 情绪列表类型 (用于数据库存储整数数组，API传输字符串数组)
type MoodList []Mood

// Value 实现driver.Valuer接口，将MoodList转换为JSON整数数组存储到数据库
func (ml MoodList) Value() (driver.Value, error) {
	if ml == nil {
		return nil, nil
	}
	// 将Mood整数数组转换为JSON
	ints := make([]int, len(ml))
	for i, m := range ml {
		ints[i] = int(m)
	}
	return json.Marshal(ints)
}

// Scan 实现sql.Scanner接口，从数据库读取JSON数组到MoodList
// 支持整数数组（新格式）和字符串数组（旧格式）
func (ml *MoodList) Scan(value interface{}) error {
	if value == nil {
		*ml = nil
		return nil
	}
	
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for MoodList")
	}
	
	// 首先尝试解析为整数数组（新格式）
	var ints []int
	if err := json.Unmarshal(bytes, &ints); err == nil {
		// 成功解析为整数数组
		moods := make([]Mood, len(ints))
		for i, v := range ints {
			moods[i] = Mood(v)
		}
		*ml = moods
		return nil
	}
	
	// 如果整数数组解析失败，尝试解析为字符串数组（旧格式）
	var strings []string
	if err := json.Unmarshal(bytes, &strings); err != nil {
		return errors.New("failed to parse MoodList: neither int array nor string array")
	}
	
	// 将字符串数组转换为MoodList
	moods := make([]Mood, len(strings))
	for i, s := range strings {
		m, err := MoodFromString(s)
		if err != nil {
			return err
		}
		moods[i] = m
	}
	*ml = moods
	return nil
}

// MarshalJSON 实现JSON序列化，将MoodList转换为JSON字符串数组（用于API）
func (ml MoodList) MarshalJSON() ([]byte, error) {
	if ml == nil {
		return json.Marshal(nil)
	}
	
	strings := make([]string, len(ml))
	for i, m := range ml {
		strings[i] = m.String()
	}
	return json.Marshal(strings)
}

// UnmarshalJSON 实现JSON反序列化，从JSON字符串数组解析到MoodList（用于API）
func (ml *MoodList) UnmarshalJSON(data []byte) error {
	// 先尝试解析为字符串数组
	var strings []string
	if err := json.Unmarshal(data, &strings); err != nil {
		return err
	}
	
	// 转换为MoodList
	moods := make([]Mood, len(strings))
	for i, s := range strings {
		m, err := MoodFromString(s)
		if err != nil {
			return err
		}
		moods[i] = m
	}
	*ml = moods
	return nil
}
