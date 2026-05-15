import type { Milestone } from '../types';

export const defaultMilestones: Omit<Milestone, 'id' | 'achievedDate'>[] = [
  { title: '社会性微笑', description: '宝宝会对熟悉的人露出微笑。', category: 'social', ageMonths: 2 },
  { title: '抬头', description: '趴着时能短暂抬起头。', category: 'motor', ageMonths: 2 },
  { title: '发出咿呀声', description: '开始发出咕咕、啊啊等声音。', category: 'language', ageMonths: 3 },
  { title: '翻身', description: '能从趴着翻到仰卧，或尝试反向翻身。', category: 'motor', ageMonths: 4 },
  { title: '抓握物品', description: '能主动伸手抓住玩具。', category: 'motor', ageMonths: 4 },
  { title: '认出照护者', description: '能区分熟悉和陌生的面孔。', category: 'cognitive', ageMonths: 5 },
  { title: '独坐', description: '不需要支撑也能坐稳一小会儿。', category: 'motor', ageMonths: 6 },
  { title: '咿呀学语', description: '会发出类似“爸爸”“妈妈”的重复音。', category: 'language', ageMonths: 7 },
  { title: '爬行', description: '能用手和膝盖配合移动。', category: 'motor', ageMonths: 8 },
  { title: '挥手再见', description: '会模仿挥手或其他简单社交动作。', category: 'social', ageMonths: 9 },
  { title: '扶站', description: '扶着家具能站起来。', category: 'motor', ageMonths: 9 },
  { title: '拇指食指捏取', description: '能用拇指和食指捏起小物品。', category: 'motor', ageMonths: 10 },
  { title: '有意识叫人', description: '开始有意识地叫“妈妈”或“爸爸”。', category: 'language', ageMonths: 11 },
  { title: '独立行走', description: '不用扶东西也能走几步。', category: 'motor', ageMonths: 12 },
  { title: '说简单词', description: '能说出几个有意义的简单词语。', category: 'language', ageMonths: 15 },
  { title: '用勺子吃饭', description: '能尝试自己用勺子舀食物。', category: 'motor', ageMonths: 18 },
  { title: '两个词短语', description: '能把两个词组合成短语。', category: 'language', ageMonths: 24 },
  { title: '跑步', description: '能比较平稳地小跑。', category: 'motor', ageMonths: 24 },
];
