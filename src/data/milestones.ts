import type { Milestone } from '../types';

export const defaultMilestones: Omit<Milestone, 'id' | 'achievedDate'>[] = [
  { title: '社交性微笑', description: '宝宝会对人微笑', category: 'social', ageMonths: 2 },
  { title: '抬头', description: '趴着时能抬起头', category: 'motor', ageMonths: 2 },
  { title: '发出咕咕声', description: '会发出"咕咕""啊啊"的声音', category: 'language', ageMonths: 3 },
  { title: '翻身', description: '能从趴着翻到仰着', category: 'motor', ageMonths: 4 },
  { title: '抓握物品', description: '能主动抓握玩具', category: 'motor', ageMonths: 4 },
  { title: '认识妈妈', description: '能区分熟悉和陌生的面孔', category: 'cognitive', ageMonths: 5 },
  { title: '独坐', description: '不需要支撑就能坐稳', category: 'motor', ageMonths: 6 },
  { title: '咿呀学语', description: '发出"爸爸""妈妈"等叠音', category: 'language', ageMonths: 7 },
  { title: '爬行', description: '能用手和膝盖爬行', category: 'motor', ageMonths: 8 },
  { title: '挥手再见', description: '会模仿挥手说再见', category: 'social', ageMonths: 9 },
  { title: '扶站', description: '扶着家具能站起来', category: 'motor', ageMonths: 9 },
  { title: '用拇指和食指捏', description: '能用拇指和食指捡起小物品', category: 'motor', ageMonths: 10 },
  { title: '叫"妈妈""爸爸"', description: '有意识地叫出"妈妈"或"爸爸"', category: 'language', ageMonths: 11 },
  { title: '独立行走', description: '不扶东西能走几步', category: 'motor', ageMonths: 12 },
  { title: '说简单的词', description: '能说出几个简单的词语', category: 'language', ageMonths: 15 },
  { title: '用勺子吃饭', description: '能自己用勺子舀食物吃', category: 'motor', ageMonths: 18 },
  { title: '两个词的短语', description: '能说出两个词组成的短语', category: 'language', ageMonths: 24 },
  { title: '跑步', description: '能平稳地跑步', category: 'motor', ageMonths: 24 },
];
