export interface ActivityPreset {
  type: string;
  label: string;
  met: number;
  icon: string;
}

const presetActivities: ActivityPreset[] = [
  { type: 'running', label: '跑步 (8km/h)', met: 8.3, icon: '🏃' },
  { type: 'brisk_walk', label: '快走 (6km/h)', met: 5.0, icon: '🚶' },
  { type: 'walk', label: '散步 (4km/h)', met: 3.0, icon: '🚶' },
  { type: 'swimming', label: '游泳 (中等)', met: 7.0, icon: '🏊' },
  { type: 'cycling', label: '骑行 (16km/h)', met: 6.0, icon: '🚴' },
  { type: 'jump_rope', label: '跳绳', met: 11.0, icon: '🤸' },
  { type: 'strength', label: '力量训练', met: 5.5, icon: '🏋️' },
  { type: 'hiit', label: 'HIIT', met: 8.0, icon: '⚡' },
  { type: 'yoga', label: '瑜伽', met: 2.5, icon: '🧘' },
  { type: 'stair_climb', label: '爬楼梯', met: 8.0, icon: '🪜' },
  { type: 'badminton', label: '羽毛球', met: 5.5, icon: '🏸' },
  { type: 'basketball', label: '篮球', met: 6.5, icon: '🏀' },
  { type: 'aerobics', label: '健身操', met: 6.0, icon: '💃' },
];

export default presetActivities;
