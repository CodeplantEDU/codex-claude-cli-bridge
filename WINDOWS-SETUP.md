# Windows Claude CLI 연결

Codex를 완전히 종료한 뒤 다시 열어 모델 목록에서 Opus 5.5 또는 Fable 5.2를 선택한다.
기존 Claude Code 구독 로그인을 사용하며 별도 Anthropic API 키를 등록하지 않았다.

재부팅 후에는 `Claude연결시작.vbs`를 먼저 실행한다. 자동 시작과 자동 재시작은 등록하지 않았다.
연결 서버가 꺼져 있으면 이 설정을 사용하는 GPT 요청도 실패한다.
기존 GPT 직접 연결로 돌아가려면 `GPT직접연결복원.cmd`를 실행하고 Codex를 다시 연다.
설정 변경 전 백업은 사용자 Codex 폴더의 `config.toml.bak-ccb-*`에 있다.

2026-11-12 확인: Claude Code 2.1.322, Codex CLI 0.166.0, Node 24.14.0.
Windows 및 프로토콜 테스트 36개 통과. Opus 5.5와 Fable 5.2의 실제 응답·테스트 도구 왕복·대화 이어가기 통과.
Codex app-server에서 기존 GPT와 두 Claude 모델의 목록 확인. 기존 GPT 응답 확인.
데스크톱 재시작 후 화면 선택, 실제 파일 수정, 브라우저 조작, 장기 대화·재부팅은 미검증.

Windows 연결에서는 Claude 내장 도구를 끄고 Codex가 전달한 도구를 사용한다.
별도 Claude MCP 설정은 불러오지 않으며 Codex의 실행·승인 경로를 사용한다.
기존 Claude 세션을 이 연결에서 재사용하지 않는다. 연결을 통해 새로 만든 세션만 이어간다.

비공식 연결이며 Codex·Claude 업데이트로 호환성이 바뀔 수 있다. 구독 사용량 제한과 Fable의 계정별 이용 조건이 적용된다.

원본: https://github.com/EthanSK/claude-in-codex (MIT).
적용한 지침: Agent Skills의 source-driven-development.
Claude 호출 규격: https://code.claude.com/docs/en/cli-reference
