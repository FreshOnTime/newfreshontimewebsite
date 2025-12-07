
import mongoose from 'mongoose';
import { RecurringOrderService, RecurringOrderPattern } from '../lib/services/recurringOrderService';
import { RRule } from 'rrule';

async function test() {
    console.log('Testing Recurring Order Logic...');

    const today = new Date('2025-01-01T10:00:00Z'); // Wed Jan 01 2025
    console.log('Today (Simulated):', today.toISOString());

    // Test 1: Weekly on Wednesdays
    console.log('\n--- Test 1: Weekly on Wednesdays ---');
    const rule1 = new RRule({
        freq: RRule.WEEKLY,
        byweekday: RRule.WE,
        dtstart: today,
    });
    console.log('Rule String:', rule1.toString());

    const pattern1: RecurringOrderPattern = {
        orderId: 'test1',
        customerId: 'cust1',
        items: [],
        recurrence: {
            rruleString: rule1.toString(),
            startDate: today,
        },
        shippingAddress: {},
        subtotal: 100,
        tax: 0,
        shipping: 0,
        total: 100,
        paymentMethod: 'cash',
    };

    const next1 = RecurringOrderService.calculateNextDelivery(pattern1, today);
    console.log('Next Delivery (Expect Wed Jan 08):', next1?.toISOString());

    // Test 2: Monthly on the 1st
    console.log('\n--- Test 2: Monthly on the 1st ---');
    const rule2 = new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 1,
        dtstart: today,
    });
    const pattern2: RecurringOrderPattern = {
        ...pattern1,
        recurrence: { rruleString: rule2.toString(), startDate: today }
    };
    const next2 = RecurringOrderService.calculateNextDelivery(pattern2, today);
    console.log('Next Delivery (Expect Feb 01):', next2?.toISOString());

    // Test 3: Every 2 Days (Custom)
    console.log('\n--- Test 3: Every 2 Days ---');
    const rule3 = new RRule({
        freq: RRule.DAILY,
        interval: 2,
        dtstart: today,
    });
    const pattern3: RecurringOrderPattern = {
        ...pattern1,
        recurrence: { rruleString: rule3.toString(), startDate: today }
    };
    const next3 = RecurringOrderService.calculateNextDelivery(pattern3, today);
    console.log('Next Delivery (Expect Jan 03):', next3?.toISOString());

    // Test 4: End Date Expiry
    console.log('\n--- Test 4: End Date Expiry ---');
    const rule4 = new RRule({
        freq: RRule.WEEKLY,
        dtstart: today,
        until: new Date('2025-01-15T00:00:00Z'), // Ends within 2 weeks
    });
    const pattern4: RecurringOrderPattern = {
        ...pattern1,
        recurrence: { rruleString: rule4.toString(), startDate: today, endDate: new Date('2025-01-15T00:00:00Z') }
    };
    // Now is Jan 01. Next: Jan 08. Next: Jan 15. Next: Jan 22 (should fail).
    const d1 = RecurringOrderService.calculateNextDelivery(pattern4, today);
    console.log('1st Delivery (Expect Jan 08):', d1?.toISOString());

    const d2 = RecurringOrderService.calculateNextDelivery(pattern4, d1 || new Date());
    console.log('2nd Delivery (Expect Jan 15):', d2?.toISOString());

    const d3 = RecurringOrderService.calculateNextDelivery(pattern4, d2 || new Date());
    console.log('3rd Delivery (Expect Null):', d3);

}

test().catch(console.error);
