<?php

namespace App\Enums;

enum LedgerType: string
{
    case Deposit = 'deposit';
    case Withdraw = 'withdraw';
    case Payment = 'payment';
    case Refund = 'refund';
    case Bonus = 'bonus';
}
