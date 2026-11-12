/** Hằng số mô phỏng. Giá trị do Yellow Aqua tự chọn (không lấy của nuoica.com); tinh chỉnh cùng người nuôi có kinh nghiệm. */
export const SIM_STEP_SEC = 60

// Đói
export const HUNGER_PER_HOUR = 0.052
export const HUNGER_START = 0.3
export const HUNGER_BANDS = { full: 0.15, satisfied: 0.4, peckish: 0.68 } as const

// Thức ăn (đơn vị dinh dưỡng)
export const UNITS_PER_PINCH = 10
export const EAT_UNITS_PER_MIN = 0.5
export const MID_SINKING_REACH = 0.3
export const FOOD_DECAY_PER_HOUR = 2
/** Chất thải thêm vào cho mỗi đơn vị thức ăn bị phân hủy, tính cho bể 100 L. */
export const FOOD_WASTE_PER_UNIT = 0.0006
/** Chất thải thêm mỗi giờ khi tỷ lệ tải = 1 (chỉ phân cá). */
export const FISH_WASTE_PER_HOUR = 0.003
/** Số lít nước cho mỗi đơn vị tải sinh học khi tỷ lệ tải = 1, chưa tính hiệu suất lọc. */
export const LITRES_PER_LOAD = 4

// Chu trình nitơ (ppm). Tỷ lệ đổi khối lượng hợp chất: NH3→NO2 ≈ 46/17, NO2→NO3 ≈ 62/46.
export const AMMONIA_PER_LOAD_L_HOUR = 0.4
export const AMMONIA_PER_FOOD_UNIT_L = 0.02
export const NH3_TO_NO2 = 2.7
export const NO2_TO_NO3 = 1.35
export const AOB_CAPACITY = 0.4
export const NOB_CAPACITY = 0.9
export const CONVERT_K = 0.3
export const AOB_GROWTH = 0.11
export const NOB_GROWTH = 0.12
export const GROW_K = 0.05
export const NO_FILTER_BIO = 0.3
export const CYCLED_AT = 0.9
export const PLANT_NO3_UPTAKE = 0.02

// Clo
export const CHLORINE_DECAY_PER_HOUR = 0.6
export const CHLORINE_PER_FRACTION = 1.5 // dùng trong changeWater

// Thay nước
export const WATER_CHANGE_COOLDOWN_MS = 4 * 3_600_000
export const SIPHON_KEEP = 0.2
export const DEFAULT_WATER_CHANGE = 0.2

// Cho ăn: số nhúm mỗi lần bấm
export const FEED_PINCH_RANGE = [0.5, 3] as const
export const DEFAULT_FEED_PINCH = 1

// Nhiệt độ (°C)
export const TEMP_APPROACH_PER_HOUR = 0.2
export const GEAR_HEAT = 0.5
export const FAN_COOLING = 2
export const HEATER_SET = 25.5
export const CHILLER_SET = 26.5
export const THERMO_RATE = 1.5

// Nhãn nước tính từ "độ bẩn" = chất thải + phần nitơ
export const DIRT_BANDS = { cloudy: 0.3, dirty: 0.55, foul: 0.8 } as const

// Sức khỏe (mỗi giờ)
export const STRESS = {
  nh3From: 0.25,
  nh3Per: 0.03,
  no2From: 0.5,
  no2Per: 0.03,
  no3From: 80,
  no3Flat: 0.01,
  tempPerDegree: 0.02,
  starvingFrom: 0.85,
  starvingFlat: 0.004, // cá không được cho ăn sống được khoảng 10 ngày
  chlorinePer: 0.25,
  o2From: 0.35,
  o2Per: 0.3,
  foulFlat: 0.02,
} as const
export const RECOVERY_PER_HOUR = 0.03
export const RELAXED_HEALTH_FLOOR = 0.3

// Lớn và sinh sản
export const BABY_GROWTH = 0.4
export const GROWTH_PER_HOUR = 0.01
export const HUNGRY_GROWTH_FACTOR = 0.5
export const BREED_PER_DAY = 0.35
export const BREED_MAX_AVG_HUNGER = 0.45
export const MAX_RENDERED_CREATURES = 120

// Thời gian vắng mặt
export const MAX_AWAY_DAYS = 10
export const MERGE_WINDOW_MS = 3_600_000
