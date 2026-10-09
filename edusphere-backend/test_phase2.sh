#!/bin/bash
# EduSphere Phase 2 – OTP + RBAC Test Suite
# Run with: bash test_phase2.sh

BASE="http://localhost:5050"
PASS=0
FAIL=0

TS=$(date +%s)
STUDENT_EMAIL="student_${TS}@test.com"
FACULTY_EMAIL="faculty_${TS}@test.com"
ADMIN_EMAIL="admin_${TS}@test.com"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check() {
  local test_name="$1"
  local expected="$2"
  local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    echo -e "${GREEN}✓ PASS${NC}: $test_name"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗ FAIL${NC}: $test_name"
    echo "  Expected to contain: $expected"
    echo "  Got: $actual"
    FAIL=$((FAIL + 1))
  fi
}

echo "================================================"
echo "  EduSphere Phase 2 – OTP & RBAC Test Suite"
echo "================================================"
echo ""

# ─── TEST 1: Request OTP (valid email) ───
echo -e "${YELLOW}--- Test 1: Request OTP (valid email) ---${NC}"
RESP=$(curl -s -X POST "$BASE/api/otp/request" \
  -H "Content-Type: application/json" \
  -H "x-test-mode: true" \
  -d "{\"email\":\"$STUDENT_EMAIL\"}")
echo "Response: $RESP"
check "OTP request returns success" "OTP sent" "$RESP"
OTP=$(echo "$RESP" | grep -o '"otp":"[0-9]*"' | grep -o '[0-9]*')
echo "Extracted OTP: $OTP"
echo ""

# ─── TEST 2: Request OTP (invalid email) ───
echo -e "${YELLOW}--- Test 2: Request OTP (invalid email) ---${NC}"
RESP=$(curl -s -X POST "$BASE/api/otp/request" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}')
echo "Response: $RESP"
check "Invalid email rejected" "Valid email required" "$RESP"
echo ""

# ─── TEST 3: Resend cooldown ───
echo -e "${YELLOW}--- Test 3: Resend cooldown ---${NC}"
RESP=$(curl -s -X POST "$BASE/api/otp/request" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\"}")
echo "Response: $RESP"
check "Resend cooldown enforced" "Please wait" "$RESP"
echo ""

# ─── TEST 4: Verify OTP (invalid/wrong OTP) ───
echo -e "${YELLOW}--- Test 4: Verify OTP (wrong OTP) ---${NC}"
RESP=$(curl -s -X POST "$BASE/api/otp/verify" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"otp\":\"000000\"}")
echo "Response: $RESP"
check "Wrong OTP rejected" "Invalid OTP" "$RESP"
echo ""

# ─── TEST 5: Verify OTP (valid) ───
echo -e "${YELLOW}--- Test 5: Verify OTP (valid) ---${NC}"
if [ -z "$OTP" ]; then
  echo -e "${RED}✗ FAIL${NC}: No OTP to verify (earlier request failed)"
  FAIL=$((FAIL + 1))
else
  RESP=$(curl -s -X POST "$BASE/api/otp/verify" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$STUDENT_EMAIL\",\"otp\":\"$OTP\"}")
  echo "Response: $RESP"
  check "Valid OTP returns token" "token" "$RESP"
  STUDENT_TOKEN=$(echo "$RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "Student token obtained: ${STUDENT_TOKEN:0:20}..."
fi
echo ""

# ─── TEST 6: OTP reuse (single-use check) ───
echo -e "${YELLOW}--- Test 6: OTP reuse (should fail – single use) ---${NC}"
if [ -z "$OTP" ]; then
  echo -e "${RED}✗ SKIP${NC}: No OTP to reuse"
  FAIL=$((FAIL + 1))
else
  RESP=$(curl -s -X POST "$BASE/api/otp/verify" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$STUDENT_EMAIL\",\"otp\":\"$OTP\"}")
  echo "Response: $RESP"
  check "OTP reuse rejected" "No OTP found" "$RESP"
fi
echo ""

# ─── TEST 7: Verify OTP (missing OTP field) ───
echo -e "${YELLOW}--- Test 7: Missing OTP field ---${NC}"
RESP=$(curl -s -X POST "$BASE/api/otp/verify" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\"}")
echo "Response: $RESP"
check "Missing OTP rejected" "6-digit" "$RESP"
echo ""

# ─── TEST 8: Register a faculty user via auth/register ───
echo -e "${YELLOW}--- Test 8: Register faculty user ---${NC}"
RESP=$(curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$FACULTY_EMAIL\",\"password\":\"Test1234!\",\"role\":\"faculty\"}")
echo "Response: $RESP"
check "Faculty registration returns token" "token" "$RESP"
FACULTY_TOKEN=$(echo "$RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Faculty token: ${FACULTY_TOKEN:0:20}..."
echo ""

# ─── TEST 9: Register an admin user via auth/register ───
echo -e "${YELLOW}--- Test 9: Register admin user ---${NC}"
RESP=$(curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"Admin1234!\",\"role\":\"admin\"}")
echo "Response: $RESP"
check "Admin registration returns token" "token" "$RESP"
ADMIN_TOKEN=$(echo "$RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Admin token: ${ADMIN_TOKEN:0:20}..."
echo ""

# ─── TEST 10: RBAC – Student accesses student-test route ───
echo -e "${YELLOW}--- Test 10: Student -> /student-test (should PASS) ---${NC}"
if [ -z "$STUDENT_TOKEN" ]; then
  echo -e "${RED}✗ SKIP${NC}: No student token"
  FAIL=$((FAIL + 1))
else
  RESP=$(curl -s -X GET "$BASE/api/admin/student-test" \
    -H "x-auth-token: $STUDENT_TOKEN")
  echo "Response: $RESP"
  check "Student can access student-test" "authenticated access verified" "$RESP"
fi
echo ""

# ─── TEST 11: RBAC – Student accesses faculty-test route (should FAIL) ───
echo -e "${YELLOW}--- Test 11: Student -> /faculty-test (should FAIL) ---${NC}"
if [ -z "$STUDENT_TOKEN" ]; then
  echo -e "${RED}✗ SKIP${NC}: No student token"
  FAIL=$((FAIL + 1))
else
  RESP=$(curl -s -X GET "$BASE/api/admin/faculty-test" \
    -H "x-auth-token: $STUDENT_TOKEN")
  echo "Response: $RESP"
  check "Student blocked from faculty route" "Forbidden" "$RESP"
fi
echo ""

# ─── TEST 12: RBAC – Student accesses admin ping (should FAIL) ───
echo -e "${YELLOW}--- Test 12: Student -> /admin/ping (should FAIL) ---${NC}"
if [ -z "$STUDENT_TOKEN" ]; then
  echo -e "${RED}✗ SKIP${NC}: No student token"
  FAIL=$((FAIL + 1))
else
  RESP=$(curl -s -X GET "$BASE/api/admin/ping" \
    -H "x-auth-token: $STUDENT_TOKEN")
  echo "Response: $RESP"
  check "Student blocked from admin route" "Admin access required" "$RESP"
fi
echo ""

# ─── TEST 13: RBAC – Faculty accesses faculty-test route (should PASS) ───
echo -e "${YELLOW}--- Test 13: Faculty -> /faculty-test (should PASS) ---${NC}"
if [ -z "$FACULTY_TOKEN" ]; then
  echo -e "${RED}✗ SKIP${NC}: No faculty token"
  FAIL=$((FAIL + 1))
else
  RESP=$(curl -s -X GET "$BASE/api/admin/faculty-test" \
    -H "x-auth-token: $FACULTY_TOKEN")
  echo "Response: $RESP"
  check "Faculty can access faculty-test" "faculty/admin access verified" "$RESP"
fi
echo ""

# ─── TEST 14: RBAC – Faculty accesses admin ping (should FAIL) ───
echo -e "${YELLOW}--- Test 14: Faculty -> /admin/ping (should FAIL) ---${NC}"
if [ -z "$FACULTY_TOKEN" ]; then
  echo -e "${RED}✗ SKIP${NC}: No faculty token"
  FAIL=$((FAIL + 1))
else
  RESP=$(curl -s -X GET "$BASE/api/admin/ping" \
    -H "x-auth-token: $FACULTY_TOKEN")
  echo "Response: $RESP"
  check "Faculty blocked from admin route" "Admin access required" "$RESP"
fi
echo ""

# ─── TEST 15: RBAC – Admin accesses admin ping (should PASS) ───
echo -e "${YELLOW}--- Test 15: Admin -> /admin/ping (should PASS) ---${NC}"
if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}✗ SKIP${NC}: No admin token"
  FAIL=$((FAIL + 1))
else
  RESP=$(curl -s -X GET "$BASE/api/admin/ping" \
    -H "x-auth-token: $ADMIN_TOKEN")
  echo "Response: $RESP"
  check "Admin can access admin route" "admin access verified" "$RESP"
fi
echo ""

# ─── TEST 16: RBAC – No token (should FAIL) ───
echo -e "${YELLOW}--- Test 16: No token -> /admin/ping (should FAIL) ---${NC}"
RESP=$(curl -s -X GET "$BASE/api/admin/ping")
echo "Response: $RESP"
check "Unauthenticated user blocked" "No token" "$RESP"
echo ""

# ─── TEST 17: RBAC – Invalid token (should FAIL) ───
echo -e "${YELLOW}--- Test 17: Invalid token -> /admin/ping (should FAIL) ---${NC}"
RESP=$(curl -s -X GET "$BASE/api/admin/ping" \
  -H "x-auth-token: totally.invalid.token")
echo "Response: $RESP"
check "Invalid token rejected" "Token is not valid" "$RESP"
echo ""

# ─── TEST 18: Existing login still works ───
echo -e "${YELLOW}--- Test 18: Existing login endpoint still works ---${NC}"
RESP=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"Admin1234!\"}")
echo "Response: $RESP"
check "Login still works" "token" "$RESP"
echo ""

# ─── SUMMARY ───
echo "================================================"
echo "  TEST SUMMARY"
echo "================================================"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo "  Total:  $((PASS + FAIL))"
echo "================================================"
