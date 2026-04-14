/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCampaignStats,
  canEditOrDeleteCampaign,
  canSendCampaign,
  parseFutureTimestamp
} from '../src/utils/campaign-rules'

test('campaign editing/deleting is allowed only for draft status', () => {
  assert.equal(canEditOrDeleteCampaign('draft'), true)
  assert.equal(canEditOrDeleteCampaign('scheduled'), false)
  assert.equal(canEditOrDeleteCampaign('sent'), false)
})

test('scheduled_at must be a valid future timestamp', () => {
  const validFuture = new Date(Date.now() + 60_000).toISOString()
  const invalidPast = new Date(Date.now() - 60_000).toISOString()

  assert.notEqual(parseFutureTimestamp(validFuture), null)
  assert.equal(parseFutureTimestamp(invalidPast), null)
  assert.equal(parseFutureTimestamp('not-a-date'), null)
})

test('sending cannot be repeated after campaign is sent', () => {
  assert.equal(canSendCampaign('draft'), true)
  assert.equal(canSendCampaign('scheduled'), true)
  assert.equal(canSendCampaign('sent'), false)
})

test('stats should return counts with safe rates', () => {
  const stats = buildCampaignStats({
    total: 20,
    sent: 15,
    failed: 5,
    opened: 9
  })

  assert.deepEqual(stats, {
    total: 20,
    sent: 15,
    failed: 5,
    opened: 9,
    open_rate: 0.6,
    send_rate: 0.75
  })

  const emptyStats = buildCampaignStats({
    total: 0,
    sent: 0,
    failed: 0,
    opened: 0
  })

  assert.deepEqual(emptyStats, {
    total: 0,
    sent: 0,
    failed: 0,
    opened: 0,
    open_rate: 0,
    send_rate: 0
  })
})
