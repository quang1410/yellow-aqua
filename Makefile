.PHONY: install test-fe typecheck build e2e perf dev

# Node của frontend. Ghim ở .nvmrc (Node 22).
NODE_MAJOR := $(shell node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)

install:
	cd frontend && npm install

# Toàn bộ kiểm tra frontend (không cần Docker): typecheck + unit test + build.
test-fe:
	@test "$(NODE_MAJOR)" -ge 22 || { \
		echo "cần Node >= 22 (xem .nvmrc), đang dùng $$(node -v 2>/dev/null || echo 'không tìm thấy node')"; \
		echo "chạy: nvm use"; exit 1; }
	cd frontend && npm run typecheck && npm run test && npm run build

typecheck:
	cd frontend && npm run typecheck

build:
	cd frontend && npm run build

# E2E Playwright trên bản build (next start), dùng Chrome đã cài trên máy.
e2e:
	cd frontend && npm run build && npm run e2e

# Đo FPS hồ 3D ở chất lượng "medium", CPU chậm 4 lần (cần GPU thật; mở cửa sổ Chrome).
perf:
	cd frontend && npm run build && npm run perf

dev:
	cd frontend && npm run dev
