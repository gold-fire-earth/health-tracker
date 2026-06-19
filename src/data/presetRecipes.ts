import type { Recipe } from '../db/database';

// Nutritional values per serving as defined by servingSize/servingUnit
const presetRecipes: Omit<Recipe, 'id'>[] = [
  // ====================================================================
  // BREAKFAST — 早点 (20 items)
  // ====================================================================
  { name: '水煮蛋', mealType: 'breakfast', calories: 78, protein: 6.5, carbs: 0.5, fat: 5.5, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '茶叶蛋', mealType: 'breakfast', calories: 73, protein: 6.2, carbs: 0.3, fat: 5, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '煎蛋', mealType: 'breakfast', calories: 120, protein: 8, carbs: 0.5, fat: 9, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '全麦面包', mealType: 'breakfast', calories: 148, protein: 6, carbs: 28, fat: 1.5, servingSize: 2, servingUnit: '片', isPreset: true },
  { name: '白吐司', mealType: 'breakfast', calories: 160, protein: 5, carbs: 30, fat: 2, servingSize: 2, servingUnit: '片', isPreset: true },
  { name: '纯牛奶', mealType: 'breakfast', calories: 163, protein: 8, carbs: 12, fat: 8.5, servingSize: 250, servingUnit: 'ml', isPreset: true },
  { name: '脱脂牛奶', mealType: 'breakfast', calories: 88, protein: 8.5, carbs: 12, fat: 0.5, servingSize: 250, servingUnit: 'ml', isPreset: true },
  { name: '豆浆', mealType: 'breakfast', calories: 80, protein: 7, carbs: 4, fat: 3.5, servingSize: 250, servingUnit: 'ml', isPreset: true },
  { name: '燕麦粥', mealType: 'breakfast', calories: 175, protein: 6, carbs: 30, fat: 3, servingSize: 250, servingUnit: 'g', isPreset: true },
  { name: '小米粥', mealType: 'breakfast', calories: 115, protein: 2.5, carbs: 22, fat: 1.5, servingSize: 250, servingUnit: 'g', isPreset: true },
  { name: '南瓜粥', mealType: 'breakfast', calories: 90, protein: 2, carbs: 18, fat: 1, servingSize: 250, servingUnit: 'g', isPreset: true },
  { name: '肉包子', mealType: 'breakfast', calories: 227, protein: 8, carbs: 30, fat: 9, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '素包子', mealType: 'breakfast', calories: 150, protein: 5, carbs: 26, fat: 3, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '馒头', mealType: 'breakfast', calories: 223, protein: 7, carbs: 44, fat: 1, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '花卷', mealType: 'breakfast', calories: 200, protein: 6, carbs: 38, fat: 3, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '油条', mealType: 'breakfast', calories: 232, protein: 5, carbs: 24, fat: 13, servingSize: 1, servingUnit: '根', isPreset: true },
  { name: '煎饼果子', mealType: 'breakfast', calories: 350, protein: 10, carbs: 45, fat: 15, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '玉米', mealType: 'breakfast', calories: 172, protein: 6, carbs: 30, fat: 3, servingSize: 1, servingUnit: '根', isPreset: true },
  { name: '红薯', mealType: 'breakfast', calories: 172, protein: 2.6, carbs: 40, fat: 0.4, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '豆腐脑', mealType: 'breakfast', calories: 60, protein: 5, carbs: 3, fat: 2.5, servingSize: 250, servingUnit: 'g', isPreset: true },

  // ====================================================================
  // STAPLES — 主食 (10 items)
  // ====================================================================
  { name: '白米饭', mealType: 'lunch', calories: 174, protein: 3.6, carbs: 38, fat: 0.4, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '糙米饭', mealType: 'lunch', calories: 185, protein: 4, carbs: 38, fat: 1.5, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '面条/汤面', mealType: 'lunch', calories: 275, protein: 9, carbs: 50, fat: 4, servingSize: 250, servingUnit: 'g', isPreset: true },
  { name: '炒面', mealType: 'lunch', calories: 400, protein: 12, carbs: 55, fat: 16, servingSize: 300, servingUnit: 'g', isPreset: true },
  { name: '炒河粉', mealType: 'lunch', calories: 420, protein: 10, carbs: 58, fat: 17, servingSize: 300, servingUnit: 'g', isPreset: true },
  { name: '炸酱面', mealType: 'lunch', calories: 500, protein: 16, carbs: 60, fat: 20, servingSize: 350, servingUnit: 'g', isPreset: true },
  { name: '白粥', mealType: 'lunch', calories: 90, protein: 2, carbs: 18, fat: 0.5, servingSize: 300, servingUnit: 'g', isPreset: true },
  { name: '杂粮饭', mealType: 'lunch', calories: 190, protein: 5, carbs: 36, fat: 2, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '饺子', mealType: 'lunch', calories: 350, protein: 15, carbs: 40, fat: 15, servingSize: 12, servingUnit: '个', isPreset: true },
  { name: '馄饨', mealType: 'lunch', calories: 280, protein: 12, carbs: 32, fat: 12, servingSize: 10, servingUnit: '个', isPreset: true },

  // ====================================================================
  // PROTEINS — 肉类蛋白 (14 items)
  // ====================================================================
  { name: '鸡胸肉', mealType: 'lunch', calories: 133, protein: 31, carbs: 0, fat: 1.5, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '鸡腿肉', mealType: 'lunch', calories: 181, protein: 20, carbs: 0, fat: 11, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '鸡蛋炒', mealType: 'lunch', calories: 199, protein: 13, carbs: 1.5, fat: 15, servingSize: 2, servingUnit: '个', isPreset: true },
  { name: '猪瘦肉', mealType: 'lunch', calories: 143, protein: 20, carbs: 1.5, fat: 6, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '猪排骨', mealType: 'lunch', calories: 264, protein: 16, carbs: 0, fat: 22, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '猪五花肉', mealType: 'lunch', calories: 395, protein: 9, carbs: 0, fat: 37, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '牛肉', mealType: 'lunch', calories: 125, protein: 22, carbs: 0, fat: 4, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '牛腩', mealType: 'lunch', calories: 205, protein: 17, carbs: 2, fat: 15, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '羊肉', mealType: 'lunch', calories: 203, protein: 19, carbs: 0, fat: 14, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '鸭肉', mealType: 'lunch', calories: 240, protein: 15, carbs: 0.1, fat: 20, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '三文鱼', mealType: 'lunch', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '虾仁', mealType: 'lunch', calories: 99, protein: 21, carbs: 0.2, fat: 0.8, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '带鱼', mealType: 'lunch', calories: 127, protein: 18, carbs: 0, fat: 5.5, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '豆腐', mealType: 'lunch', calories: 114, protein: 12, carbs: 3, fat: 6, servingSize: 150, servingUnit: 'g', isPreset: true },

  // ====================================================================
  // CHINESE DISHES — 家常菜 (26 items)
  // ====================================================================
  { name: '番茄炒蛋', mealType: 'lunch', calories: 178, protein: 8, carbs: 8, fat: 12, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '青椒肉丝', mealType: 'lunch', calories: 198, protein: 16, carbs: 10, fat: 10, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '麻婆豆腐', mealType: 'dinner', calories: 186, protein: 12, carbs: 8, fat: 12, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '宫保鸡丁', mealType: 'dinner', calories: 240, protein: 20, carbs: 12, fat: 14, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '鱼香肉丝', mealType: 'dinner', calories: 210, protein: 14, carbs: 14, fat: 11, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '糖醋里脊', mealType: 'dinner', calories: 310, protein: 18, carbs: 22, fat: 16, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '红烧肉', mealType: 'dinner', calories: 305, protein: 10, carbs: 5, fat: 28, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '回锅肉', mealType: 'dinner', calories: 310, protein: 15, carbs: 8, fat: 26, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '黄焖鸡', mealType: 'dinner', calories: 280, protein: 22, carbs: 8, fat: 18, servingSize: 250, servingUnit: 'g', isPreset: true },
  { name: '酸菜鱼', mealType: 'dinner', calories: 220, protein: 24, carbs: 4, fat: 12, servingSize: 300, servingUnit: 'g', isPreset: true },
  { name: '清蒸鱼', mealType: 'dinner', calories: 160, protein: 28, carbs: 2, fat: 5, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '红烧鱼', mealType: 'dinner', calories: 210, protein: 22, carbs: 5, fat: 12, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '麻辣烫', mealType: 'lunch', calories: 350, protein: 18, carbs: 25, fat: 20, servingSize: 500, servingUnit: 'g', isPreset: true },
  { name: '蛋炒饭', mealType: 'lunch', calories: 450, protein: 13, carbs: 55, fat: 16, servingSize: 300, servingUnit: 'g', isPreset: true },
  { name: '盖浇饭', mealType: 'lunch', calories: 550, protein: 18, carbs: 65, fat: 22, servingSize: 400, servingUnit: 'g', isPreset: true },
  { name: '干煸豆角', mealType: 'lunch', calories: 160, protein: 4, carbs: 14, fat: 10, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '酸辣土豆丝', mealType: 'lunch', calories: 130, protein: 2.5, carbs: 20, fat: 5, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '地三鲜', mealType: 'lunch', calories: 200, protein: 3, carbs: 18, fat: 14, servingSize: 250, servingUnit: 'g', isPreset: true },
  { name: '木须肉', mealType: 'lunch', calories: 190, protein: 14, carbs: 8, fat: 12, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '孜然羊肉', mealType: 'lunch', calories: 260, protein: 18, carbs: 4, fat: 20, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '葱爆牛肉', mealType: 'lunch', calories: 230, protein: 20, carbs: 6, fat: 15, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '红烧排骨', mealType: 'lunch', calories: 320, protein: 16, carbs: 6, fat: 26, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '可乐鸡翅', mealType: 'lunch', calories: 280, protein: 18, carbs: 10, fat: 18, servingSize: 5, servingUnit: '个', isPreset: true },
  { name: '蒜蓉西兰花', mealType: 'lunch', calories: 80, protein: 4, carbs: 8, fat: 4, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '蚝油生菜', mealType: 'lunch', calories: 55, protein: 2.5, carbs: 5, fat: 3, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '凉拌黄瓜', mealType: 'lunch', calories: 30, protein: 1, carbs: 5, fat: 1, servingSize: 150, servingUnit: 'g', isPreset: true },

  // ====================================================================
  // VEGETABLES — 蔬菜 (10 items)
  // ====================================================================
  { name: '西兰花', mealType: 'lunch', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '炒青菜', mealType: 'lunch', calories: 60, protein: 3, carbs: 8, fat: 3, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '菠菜', mealType: 'lunch', calories: 28, protein: 2.9, carbs: 3.6, fat: 0.3, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '大白菜', mealType: 'lunch', calories: 15, protein: 1.5, carbs: 2.4, fat: 0.1, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '西红柿', mealType: 'lunch', calories: 20, protein: 0.9, carbs: 4, fat: 0.2, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '胡萝卜', mealType: 'lunch', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '金针菇', mealType: 'lunch', calories: 32, protein: 2.4, carbs: 6, fat: 0.4, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '豆芽', mealType: 'lunch', calories: 25, protein: 2.5, carbs: 3.5, fat: 0.2, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '茄子', mealType: 'lunch', calories: 23, protein: 1, carbs: 4.6, fat: 0.2, servingSize: 150, servingUnit: 'g', isPreset: true },
  { name: '芹菜', mealType: 'lunch', calories: 16, protein: 0.8, carbs: 3.3, fat: 0.1, servingSize: 100, servingUnit: 'g', isPreset: true },

  // ====================================================================
  // HOT POT / MALATANG — 火锅/麻辣烫单品 (8 items)
  // ====================================================================
  { name: '火锅肥牛', mealType: 'lunch', calories: 250, protein: 16, carbs: 0, fat: 21, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '火锅羊肉卷', mealType: 'lunch', calories: 230, protein: 18, carbs: 0, fat: 18, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '毛肚', mealType: 'lunch', calories: 85, protein: 15, carbs: 0.5, fat: 2.5, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '虾滑', mealType: 'lunch', calories: 110, protein: 18, carbs: 5, fat: 2, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '鱼丸', mealType: 'lunch', calories: 120, protein: 8, carbs: 12, fat: 5, servingSize: 5, servingUnit: '个', isPreset: true },
  { name: '蟹棒', mealType: 'lunch', calories: 90, protein: 7, carbs: 10, fat: 2, servingSize: 4, servingUnit: '根', isPreset: true },
  { name: '鹌鹑蛋', mealType: 'lunch', calories: 80, protein: 6.5, carbs: 0.5, fat: 5.5, servingSize: 5, servingUnit: '个', isPreset: true },
  { name: '火锅蘸料(麻酱)', mealType: 'lunch', calories: 180, protein: 4, carbs: 6, fat: 16, servingSize: 50, servingUnit: 'g', isPreset: true },

  // ====================================================================
  // FAST FOOD — 快餐 (8 items)
  // ====================================================================
  { name: '汉堡', mealType: 'lunch', calories: 450, protein: 20, carbs: 35, fat: 25, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '薯条(中)', mealType: 'lunch', calories: 320, protein: 4, carbs: 42, fat: 16, servingSize: 1, servingUnit: '份', isPreset: true },
  { name: '炸鸡腿', mealType: 'lunch', calories: 280, protein: 18, carbs: 8, fat: 20, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '炸鸡排', mealType: 'lunch', calories: 350, protein: 22, carbs: 12, fat: 24, servingSize: 1, servingUnit: '块', isPreset: true },
  { name: '披萨(6寸)', mealType: 'lunch', calories: 600, protein: 25, carbs: 65, fat: 25, servingSize: 0.5, servingUnit: '个', isPreset: true },
  { name: '黄焖鸡米饭', mealType: 'lunch', calories: 530, protein: 24, carbs: 45, fat: 24, servingSize: 1, servingUnit: '份', isPreset: true },
  { name: '沙县蒸饺', mealType: 'lunch', calories: 280, protein: 12, carbs: 30, fat: 13, servingSize: 1, servingUnit: '笼', isPreset: true },
  { name: '兰州拉面', mealType: 'lunch', calories: 480, protein: 18, carbs: 58, fat: 18, servingSize: 1, servingUnit: '碗', isPreset: true },

  // ====================================================================
  // PACKAGED / INSTANT FOODS — 包装食品 (8 items)
  // ====================================================================
  { name: '方便面', mealType: 'lunch', calories: 450, protein: 9, carbs: 58, fat: 20, servingSize: 1, servingUnit: '包', isPreset: true },
  { name: '速冻水饺', mealType: 'lunch', calories: 320, protein: 14, carbs: 36, fat: 14, servingSize: 15, servingUnit: '个', isPreset: true },
  { name: '火腿肠', mealType: 'lunch', calories: 130, protein: 6, carbs: 8, fat: 8, servingSize: 1, servingUnit: '根', isPreset: true },
  { name: '午餐肉', mealType: 'lunch', calories: 230, protein: 11, carbs: 4, fat: 20, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '榨菜', mealType: 'lunch', calories: 25, protein: 1, carbs: 4, fat: 0.5, servingSize: 50, servingUnit: 'g', isPreset: true },
  { name: '老干妈', mealType: 'lunch', calories: 60, protein: 1, carbs: 2, fat: 6, servingSize: 15, servingUnit: 'g', isPreset: true },
  { name: '八宝粥(罐装)', mealType: 'lunch', calories: 200, protein: 3, carbs: 42, fat: 2, servingSize: 1, servingUnit: '罐', isPreset: true },
  { name: '自热米饭', mealType: 'lunch', calories: 500, protein: 16, carbs: 55, fat: 22, servingSize: 1, servingUnit: '盒', isPreset: true },

  // ====================================================================
  // FRUITS — 水果 (14 items)
  // ====================================================================
  { name: '苹果', mealType: 'snack', calories: 104, protein: 0.5, carbs: 28, fat: 0.3, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '香蕉', mealType: 'snack', calories: 112, protein: 1.4, carbs: 27, fat: 0.3, servingSize: 1, servingUnit: '根', isPreset: true },
  { name: '橙子', mealType: 'snack', calories: 94, protein: 1.6, carbs: 22, fat: 0.4, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '葡萄', mealType: 'snack', calories: 138, protein: 1.2, carbs: 34, fat: 0.3, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '西瓜', mealType: 'snack', calories: 90, protein: 2, carbs: 20, fat: 0, servingSize: 300, servingUnit: 'g', isPreset: true },
  { name: '草莓', mealType: 'snack', calories: 64, protein: 1.2, carbs: 14, fat: 0.5, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '蓝莓', mealType: 'snack', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '芒果', mealType: 'snack', calories: 130, protein: 1, carbs: 30, fat: 0.8, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '梨', mealType: 'snack', calories: 100, protein: 0.7, carbs: 26, fat: 0.3, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '桃子', mealType: 'snack', calories: 80, protein: 1.5, carbs: 19, fat: 0.3, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '猕猴桃', mealType: 'snack', calories: 61, protein: 1.2, carbs: 14.5, fat: 0.5, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '柚子', mealType: 'snack', calories: 85, protein: 1.5, carbs: 19, fat: 0.4, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '樱桃', mealType: 'snack', calories: 63, protein: 1, carbs: 16, fat: 0.2, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '菠萝', mealType: 'snack', calories: 100, protein: 1, carbs: 25, fat: 0.2, servingSize: 200, servingUnit: 'g', isPreset: true },

  // ====================================================================
  // SNACKS / DESSERTS — 零食甜品 (12 items)
  // ====================================================================
  { name: '混合坚果', mealType: 'snack', calories: 180, protein: 5, carbs: 5, fat: 16, servingSize: 30, servingUnit: 'g', isPreset: true },
  { name: '核桃', mealType: 'snack', calories: 160, protein: 4, carbs: 2, fat: 16, servingSize: 25, servingUnit: 'g', isPreset: true },
  { name: '蛋白粉', mealType: 'snack', calories: 120, protein: 24, carbs: 2, fat: 1.5, servingSize: 30, servingUnit: 'g', isPreset: true },
  { name: '酸奶', mealType: 'snack', calories: 144, protein: 5, carbs: 18, fat: 5.5, servingSize: 200, servingUnit: 'g', isPreset: true },
  { name: '全麦饼干', mealType: 'snack', calories: 130, protein: 2, carbs: 20, fat: 4.5, servingSize: 30, servingUnit: 'g', isPreset: true },
  { name: '巧克力', mealType: 'snack', calories: 220, protein: 2.5, carbs: 22, fat: 14, servingSize: 40, servingUnit: 'g', isPreset: true },
  { name: '薯片', mealType: 'snack', calories: 270, protein: 3.5, carbs: 26, fat: 18, servingSize: 60, servingUnit: 'g', isPreset: true },
  { name: '冰淇淋(甜筒)', mealType: 'snack', calories: 200, protein: 4, carbs: 25, fat: 9, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '蛋挞', mealType: 'snack', calories: 180, protein: 4, carbs: 18, fat: 10, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '蛋糕(奶油)', mealType: 'snack', calories: 350, protein: 5, carbs: 35, fat: 22, servingSize: 100, servingUnit: 'g', isPreset: true },
  { name: '肉松饼', mealType: 'snack', calories: 150, protein: 5, carbs: 16, fat: 7, servingSize: 1, servingUnit: '个', isPreset: true },
  { name: '能量棒', mealType: 'snack', calories: 190, protein: 8, carbs: 22, fat: 8, servingSize: 1, servingUnit: '根', isPreset: true },

  // ====================================================================
  // BEVERAGES — 饮品 (10 items)
  // ====================================================================
  { name: '美式咖啡', mealType: 'snack', calories: 5, protein: 0, carbs: 0, fat: 0, servingSize: 350, servingUnit: 'ml', isPreset: true },
  { name: '拿铁咖啡', mealType: 'snack', calories: 150, protein: 8, carbs: 12, fat: 8, servingSize: 350, servingUnit: 'ml', isPreset: true },
  { name: '可乐', mealType: 'snack', calories: 139, protein: 0, carbs: 35, fat: 0, servingSize: 330, servingUnit: 'ml', isPreset: true },
  { name: '零度可乐', mealType: 'snack', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: 330, servingUnit: 'ml', isPreset: true },
  { name: '橙汁', mealType: 'snack', calories: 135, protein: 1, carbs: 31, fat: 0.5, servingSize: 330, servingUnit: 'ml', isPreset: true },
  { name: '奶茶(珍珠)', mealType: 'snack', calories: 350, protein: 3, carbs: 45, fat: 16, servingSize: 500, servingUnit: 'ml', isPreset: true },
  { name: '啤酒', mealType: 'snack', calories: 130, protein: 1.5, carbs: 11, fat: 0, servingSize: 500, servingUnit: 'ml', isPreset: true },
  { name: '白酒', mealType: 'snack', calories: 220, protein: 0, carbs: 0, fat: 0, servingSize: 100, servingUnit: 'ml', isPreset: true },
  { name: '运动饮料', mealType: 'snack', calories: 110, protein: 0, carbs: 27, fat: 0, servingSize: 500, servingUnit: 'ml', isPreset: true },
  { name: '椰子水', mealType: 'snack', calories: 55, protein: 0.5, carbs: 13, fat: 0, servingSize: 330, servingUnit: 'ml', isPreset: true },
];

export default presetRecipes;
