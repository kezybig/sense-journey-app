// 枚举常量定义
// 与后端models/enums.go中的枚举保持一致

// Budget 预算枚举 (字符串值)
export const Budget = {
  ZERO: '0',
  FIVE_HUNDRED: '500',
  THOUSAND: '1000',
  FIFTEEN_HUNDRED: '1500',
  TWO_THOUSAND: '2000',
  TWO_THOUSAND_FIVE_HUNDRED: '2500',
  THREE_THOUSAND: '3000',
  THREE_THOUSAND_PLUS: '3000+'
};

// Duration 持续时间枚举 (字符串值)
export const Duration = {
  ONE_TO_TWO: '1-2',
  THREE_TO_FIVE: '3-5',
  FIVE_TO_SEVEN: '5-7',
  SEVEN_PLUS: '7+'
};

// Proximity 距离范围枚举 (字符串值)
export const Proximity = {
  ONE_TO_THREE_HOURS: '1-3H',
  THREE_TO_FIVE_HOURS: '3-5H',
  FIVE_TO_SEVEN_HOURS: '5-7H',
  SEVEN_PLUS_HOURS: '7+H'
};

// Transport 交通方式枚举 (字符串值)
export const Transport = {
  PUBLIC: '公共交通',
  SELF_DRIVE: '自驾',
  HIGH_SPEED: '高铁',
  FLIGHT: '飞机'
};

// Mood 情绪枚举 (字符串值)
export const Mood = {
  QUIET_ALONE: '安静独处',
  EXERCISE: '运动释放',
  NEED_GREEN: '需要绿色',
  WANT_DRINK: '想喝一杯',
  ADVENTURE_EXPLORE: '冒险探索'
};

// 默认值
export const DefaultValues = {
  BUDGET: Budget.FIVE_HUNDRED,
  DURATION: Duration.ONE_TO_TWO,
  PROXIMITY: Proximity.ONE_TO_THREE_HOURS,
  TRANSPORT: Transport.PUBLIC,
  MOODS: [Mood.QUIET_ALONE]
};

// 选项数组 (用于UI组件)
export const BudgetOptions = [
  Budget.ZERO,
  Budget.FIVE_HUNDRED,
  Budget.THOUSAND,
  Budget.FIFTEEN_HUNDRED,
  Budget.TWO_THOUSAND,
  Budget.TWO_THOUSAND_FIVE_HUNDRED,
  Budget.THREE_THOUSAND,
  Budget.THREE_THOUSAND_PLUS
];

export const DurationOptions = [
  Duration.ONE_TO_TWO,
  Duration.THREE_TO_FIVE,
  Duration.FIVE_TO_SEVEN,
  Duration.SEVEN_PLUS
];

export const ProximityOptions = [
  Proximity.ONE_TO_THREE_HOURS,
  Proximity.THREE_TO_FIVE_HOURS,
  Proximity.FIVE_TO_SEVEN_HOURS,
  Proximity.SEVEN_PLUS_HOURS
];

export const TransportOptions = [
  Transport.PUBLIC,
  Transport.SELF_DRIVE,
  Transport.HIGH_SPEED,
  Transport.FLIGHT
];

export const MoodOptions = [
  Mood.QUIET_ALONE,
  Mood.EXERCISE,
  Mood.NEED_GREEN,
  Mood.WANT_DRINK,
  Mood.ADVENTURE_EXPLORE
];