import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'gpa-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['usability'],
  competitors: [
    {
      name: 'Toolbaro — GPA Calculator',
      url: 'https://toolbaro.com/en/gpa-calculator/',
      weakness:
        'Its result-page listing advertises a selectable 4.0, 4.3, or 4.5 scale alongside semester/cumulative options, but does not offer a three-scale comparison in the result itself. Betterbit recalculates the same entered courses against 4.5, 4.3, and 4.0 tables side by side. (Strength: it also supports major GPA, Pass/No Pass, and Honors/AP weighting.)',
    },
    {
      name: 'GradeCalc — GPA Calculator',
      url: 'https://study.moneycomon.com/en/gpa.html',
      weakness:
        'Its calculator asks the visitor to pick one 4.5, 4.3, or 4.0 grade scale before entering grades, then shows that selected GPA. Betterbit keeps one course list and shows all three scale results simultaneously. (Strength: it also provides a separate grade-scale converter and class-rank tools.)',
    },
    {
      name: 'GPA Calculator — Free Online Grade Point Average Calculator',
      url: 'https://gpa-calculator.cn/en/',
      weakness:
        'Its visible calculator uses one radio-selected grading scale at a time, although it supports 4.0, 4.3, 4.5, and 5.0; the result area has one “Your GPA” value. Betterbit shows 4.5, 4.3, and 4.0 results together from the same course rows. (Strength: it can import a pasted transcript, organize semesters, and plan toward a target GPA.)',
    },
    {
      name: '학점 계산기 — Cacaos',
      url: 'https://cacaos.kr/',
      weakness:
        'Its visible scale buttons cover 4.5 만점 and 4.3 만점 only, and its result section shows one selected GPA. Betterbit calculates 4.5·4.3·4.0 만점을 나란히 보여주므로 과목을 다시 입력하거나 척도를 다시 고를 필요가 없다. (장점: 누적 GPA와 목표 평점에 필요한 성적을 한 페이지에서 계산한다.)',
    },
    {
      name: '툴쏙 — 학점 계산기',
      url: 'https://toolssok.com/gpa-calculator/',
      weakness:
        'Its search result describes 4.5·4.3 만점 GPA calculation from courses and credits, but not a 4.0 result or a side-by-side scale comparison. Betterbit는 같은 과목 목록을 4.5·4.3·4.0 표로 동시에 다시 계산한다. (장점: 국내 대학에서 쓰는 표준값과 사용 사례를 간단히 안내한다.)',
    },
    {
      name: 'smith lab — 학점 계산기',
      url: 'https://smithlab.co.kr/calculator/grade-calculator/',
      weakness:
        'Its visible description asks users to choose either a 4.5 or 4.3 school scale and returns that GPA and total credits, so comparing scales requires changing the selection. Betterbit는 4.5·4.3·4.0 세 결과를 한 화면에서 유지한다. (장점: 이수학점을 빼고 단순 평균하면 틀릴 수 있다는 예시를 명확히 설명한다.)',
    },
  ],
  related: [
    'percentage-calculator',
    'scientific-calculator',
    'compound-interest',
    'discount-calculator',
    'average-calculator',
  ],
};
