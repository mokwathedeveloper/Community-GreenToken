# Community GreenToken API Endpoints

This document provides a **professional reference for all API endpoints** used in the Community GreenToken web application, including input/output formats, authentication requirements, and error handling.

---

## 1. User Actions
### Endpoint: `/api/actions/submit`
- **Method:** POST
- **Description:** Submit a new sustainable action.
- **Authentication:** Required (user wallet or Supabase Auth)
- **Request Body:**
```json
{
  "user_id": "string",
  "action_type": "string",
  "description": "string",
  "timestamp": "ISO8601 string"
}
```
- **Response:**
```json
{
  "status": "success",
  "action_id": "string",
  "message": "Action submitted successfully."
}
```
- **Error Codes:**
  - 400: Invalid input data
  - 401: Unauthorized
  - 500: Internal server error

### Endpoint: `/api/actions/verify`
- **Method:** POST
- **Description:** Verify a submitted action.
- **Authentication:** Admin only
- **Request Body:**
```json
{
  "action_id": "string",
  "verified": true
}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Action verified and tokens minted."
}
```
- **Error Codes:**
  - 400: Invalid action ID
  - 403: Forbidden
  - 500: Internal server error

## 2. Token Management
### Endpoint: `/api/tokens/balance`
- **Method:** GET
- **Description:** Retrieve current token balance for a user.
- **Authentication:** Required
- **Query Parameters:**
```text
user_id=string
```
- **Response:**
```json
{
  "user_id": "string",
  "balance": 120
}
```
- **Error Codes:**
  - 401: Unauthorized
  - 404: User not found

### Endpoint: `/api/tokens/redeem`
- **Method:** POST
- **Description:** Redeem tokens for rewards or donations.
- **Authentication:** Required
- **Request Body:**
```json
{
  "user_id": "string",
  "reward_id": "string",
  "amount": 50
}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Tokens redeemed successfully."
}
```
- **Error Codes:**
  - 400: Invalid request
  - 401: Unauthorized
  - 403: Insufficient tokens
  - 404: Reward not found
  - 500: Internal server error

## 3. Leaderboard
### Endpoint: `/api/leaderboard`
- **Method:** GET
- **Description:** Retrieve leaderboard of top participants.
- **Authentication:** Optional
- **Response:**
```json
[
  {"user_id": "string", "username": "string", "tokens_earned": 500},
  {"user_id": "string", "username": "string", "tokens_earned": 450}
]
```
- **Error Codes:**
  - 500: Internal server error

## 4. Analytics / Impact Metrics
### Endpoint: `/api/analytics/metrics`
- **Method:** GET
- **Description:** Get aggregated metrics for participation and community impact.
- **Authentication:** Admin only
- **Response:**
```json
{
  "total_actions": 1200,
  "total_tokens_minted": 50000,
  "donations_total": 3000
}
```
- **Error Codes:**
  - 401: Unauthorized
  - 500: Internal server error

## 5. Error Handling Standards
- **400 Bad Request:** Invalid input or missing fields.
- **401 Unauthorized:** Missing or invalid authentication credentials.
- **403 Forbidden:** User does not have permission to perform action.
- **404 Not Found:** Resource does not exist.
- **500 Internal Server Error:** Unexpected error, log for debugging.

All API responses follow a **consistent JSON structure**, and proper authentication is enforced for sensitive operations.

