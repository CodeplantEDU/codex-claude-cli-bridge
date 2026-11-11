import json
from pathlib import Path
import sys

root = Path(sys.argv[1])
key = 'codex-claude-bridge'
folder = root / 'external' / key
folder.mkdir(parents=True, exist_ok=True)
source = {'repository': 'EthanSK/claude-in-codex', 'commit': 'a6818e8a3ae62a336209d1bc0b3659d2501420b8', 'license': 'MIT', 'last_checked': '2026-11-12', 'validation': {'windows_protocol_tests': 36, 'opus_5_5_tool_roundtrip': True, 'fable_5_2_tool_roundtrip': True, 'codex_model_list': True, 'gpt_response': True, 'desktop_restart': False, 'autostart': False}}
(folder / 'SOURCE.json').write_text(json.dumps(source, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(folder / 'README.md').write_text('''# Claude CLI를 Codex에 연결

[원본 저장소](https://github.com/EthanSK/claude-in-codex) · MIT · 커밋 `a6818e8a3ae62a336209d1bc0b3659d2501420b8`

Claude Code의 기존 구독 로그인으로 Codex에서 Opus 5.5와 Fable 5.2를 선택하는 비공식 로컬 연결이다. 별도 Anthropic API 키는 사용하지 않는다.

2026-11-12: Claude Code 2.1.322, Codex CLI 0.166.0, Node 24.14.0. Windows 파이프·긴 프롬프트 파일 전달·숨김 자식 프로세스·취소할 프로세스 식별을 보완했다. Windows에서는 Claude 내장 도구와 별도 MCP를 비활성화하고 Codex 도구 실행 경로를 사용한다.

프로토콜·Windows 테스트 36개와 두 모델의 실제 테스트 도구 호출·결과 전달·대화 이어가기, Codex 모델 목록과 GPT 실제 응답을 확인했다. 데스크톱 재시작 후 선택 화면, 실제 파일 수정·브라우저 조작·재부팅은 미검증이다.

자동 시작·자동 재시작은 등록하지 않았다. 로컬 연결이 꺼지면 이 경로의 GPT도 실패하므로 수동으로 연결 프로그램을 실행하거나 연결 주소를 원복해야 한다. 원래 설정의 백업과 원복 명령을 준비했다. 구독 사용량과 모델별 계정 조건이 적용된다.

앱 실행 파일, 자격 증명, 개인 설정과 대화 기록은 이 저장소에 보관하지 않는다. 원본·검증 기록만 등록한다.
''', encoding='utf-8')
catalog_path = root / 'catalog.json'
catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
package = {'id': key, 'category': 'external', 'path': 'external/'+key, 'description': 'Claude CLI 구독 로그인으로 Codex에 Opus 5.5·Fable 5.2를 연결하는 로컬 도구', 'source': source, 'install_method': 'application', 'status': '로컬 설정·CLI 왕복 확인. 자동 시작 없음. 데스크톱 재시작 후 화면 미검증.'}
catalog['packages'] = [p for p in catalog['packages'] if p['id'] != key] + [package]
catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
guide_path = root / 'skill-library-guides.json'
guides = json.loads(guide_path.read_text(encoding='utf-8'))
guides['bundles'][key] = {'title':'Codex Claude CLI 연결','use':'Claude Code 구독 로그인으로 Opus·Fable을 선택합니다. 로컬 연결 프로그램이 실행 중이어야 합니다.','example':'Codex의 Claude CLI 연결과 모델 목록을 확인해줘. API 키는 사용하지 마.'}
guide_path.write_text(json.dumps(guides,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for name, link in [('README.md','external/'+key+'/README.md'),('external/README.md',key+'/README.md')]:
    p=root/name
    text=p.read_text(encoding='utf-8')
    if ']('+link+')' not in text:
        p.write_text(text+'\n- [Codex Claude CLI 연결]('+link+') — Opus·Fable 구독 CLI 연결\n',encoding='utf-8')
print('Registered codex-claude-bridge')
