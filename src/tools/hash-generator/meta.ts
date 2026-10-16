import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'hash-generator',
  category: 'developer',
  icon: 'shield',
  added: '2026-10-15',
  updated: '2026-10-16',
  edges: ['privacy', 'usability'],
  competitors: [
    {
      name: 'Go Tools — SHA-256 Generator',
      url: 'https://go-tools.org/tools/sha-256-generator',
      weakness:
        'Its opened SHA-256 page exposes a separate “Generate Hash” action, while Betterbit updates the selected text digest as it is edited and keeps checksum matching beside the result. (Strength: it also offers SHA-3 and a dedicated comparison tab.)',
    },
    {
      name: 'SHAGenerator.com',
      url: 'https://www.shagenerator.com/',
      weakness:
        'Its opened SHA-256 page routes file hashing, checksum verification, multi-hash output, and HMAC to separate linked tools. Betterbit keeps text or file input, the five common checksum algorithms, and an expected-hash match in one focused panel. (Strength: its dedicated file tool streams very large files in chunks.)',
    },
    {
      name: 'InventiveHQ — MD5 Generator',
      url: 'https://inventivehq.com/tools/security/md5-generator',
      weakness:
        'The opened MD5 generator displays an “Advertisement” block directly beneath its introduction. Betterbit has no advertising and shows the selected digest and checksum match without a separate submit step. (Strength: it describes chunked 4 MB file reads for very large files.)',
    },
    {
      name: '유틸로 — 해시·체크섬 생성기',
      url: 'https://utilo.co.kr/tools/hash-generator/',
      weakness:
        'Its opened Korean page explains that MD5 is unavailable because the browser Web Crypto API does not provide it. Betterbit includes a tested local MD5 implementation alongside SHA-1, SHA-256, SHA-384, and SHA-512. (장점: 파일과 예상 해시를 비교하는 흐름을 자세히 설명한다.)',
    },
    {
      name: '모두의계산기 — 해시 생성기',
      url: 'https://ko.buildfigure.org/tools/hash-generator',
      weakness:
        'Its opened Korean page asks the user to press “계산” after entering text or selecting a file. Betterbit recalculates the chosen algorithm as input changes and accepts colon-separated or spaced checksum formatting for comparison. (장점: SHA·MD5·CRC32 값을 한 번에 여섯 개 표시한다.)',
    },
    {
      name: 'Go Tools — SHA-256 해시 생성기',
      url: 'https://go-tools.org/ko/tools/sha-256-generator',
      weakness:
        'Its opened Korean result places text, file, and comparison in separate modes and asks for a “해시 생성” action. Betterbit keeps the currently selected input and expected-checksum result on one screen and recalculates it immediately. (장점: SHA-3도 선택할 수 있고 큰 파일의 진행 상황을 설명한다.)',
    },
  ],
  related: ['base64', 'json-formatter', 'uuid-generator', 'password-generator'],
};
