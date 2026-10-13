import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'calorie-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Mayo Clinic — Calorie Calculator',
      url: 'https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/calorie-calculator/itt-20402304',
      weakness:
        'Its flow separates sex and activity across “Next” and “Calculate” actions, rounds its daily-needs outputs to the nearest 50 calories, and says it is based on the Harris-Benedict equation without showing the calculation using the visitor’s values. Betterbit updates while typing and prints the substituted Mifflin–St Jeor formula. (Strength: it gives clear activity examples and a prominent warning for pregnancy, competitive athletes, and metabolic disease.)',
    },
    {
      name: 'Calorie Cal — Calorie Calculator',
      url: 'https://caloriecal.io/',
      weakness:
        'Its main calculator puts body-fat percentage, formula choice, and optional exercise burn behind an “Advanced options” disclosure, while the immediate result area reports BMR and TDEE as totals rather than printing the entered age, height, weight, and sex constant in the equation. Betterbit keeps its single Mifflin–St Jeor method and the substituted calculation visible with the result. (Strength: it supports Katch-McArdle and Harris-Benedict, editable macros, sharing, and export.)',
    },
    {
      name: 'TDEE.co — TDEE Calculator',
      url: 'https://tdee.co/',
      weakness:
        'Its page adds body-fat percentage and a formula-switching advanced path, but its visible result presents BMR and maintenance as summary figures and its explanation is spread through a long numbered guide. Betterbit limits the starting screen to the Mifflin–St Jeor inputs and exposes the exact personal formula and two multipliers directly below the result. (Strength: it is medically reviewed and includes macro targets and a detailed activity-level guide.)',
    },
    {
      name: '모두계산 — 기초대사량 계산기',
      url: 'https://moducalc.mycafe24.com/bmr',
      weakness:
        'The page identifies Mifflin-St Jeor as its basis and says that it also shows maintenance and goal calories, but the visible result area initially says only “값을 입력해 주세요” and its explanatory text does not show a visitor’s values substituted into the formula. Betterbit shows the four input terms, the sex constant, and the rounded BMR together as values change. (장점: 기초대사량·유지 칼로리·감량·증량 참고치를 한 페이지에서 안내한다.)',
    },
    {
      name: '툴쏙 — 기초대사량 계산기',
      url: 'https://toolssok.com/bmr-calculator/',
      weakness:
        'It requires a separate “계산하기” action after entering several optional inputs and includes formula, body-fat, target-weight, diet-type, macro, and duration controls before its results. Betterbit gives a live Mifflin–St Jeor BMR and maintenance estimate from the four required inputs, with the exact calculation exposed before any extra planning choices. (장점: 체지방률을 사용한 카치-맥아들 비교, 탄단지, 목표 체중 기간까지 폭넓게 제공한다.)',
    },
    {
      name: 'CalculKorea — 기초대사량/체지방률 계산기',
      url: 'https://www.calculkorea.com/bmr-body-fat',
      weakness:
        'Its listed workflow is basic details → activity level → optional body-fat inputs → “계산하기”, so results do not update until a calculation action is requested. The initial controls also do not surface the Mifflin–St Jeor arithmetic next to the estimate. Betterbit recalculates on each valid input change and makes the BMR and TDEE multipliers readable in the result panel. (장점: 선택적으로 US Navy 체지방률 측정 입력을 제공한다.)',
    },
  ],
  related: ['bmi-calculator', 'age-calculator', 'weight-converter', 'percentage-calculator'],
};
