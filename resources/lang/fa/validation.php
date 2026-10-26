<?php

return [
    'required' => 'وارد کردن :attribute الزامی است.',
    'string' => ':attribute باید متن باشد.',
    'email' => 'نشانی ایمیل معتبر وارد کنید.',
    'unique' => 'این :attribute قبلاً ثبت شده است.',
    'confirmed' => 'تکرار :attribute با آن یکسان نیست.',
    'min' => ['string' => ':attribute باید حداقل :min نویسه داشته باشد.'],
    'max' => ['string' => ':attribute نباید بیشتر از :max نویسه داشته باشد.'],
    'password' => [
        'letters' => ':attribute باید حداقل یک حرف داشته باشد.',
        'mixed' => ':attribute باید حروف کوچک و بزرگ داشته باشد.',
        'numbers' => ':attribute باید حداقل یک عدد داشته باشد.',
        'symbols' => ':attribute باید حداقل یک نماد داشته باشد.',
        'uncompromised' => 'این :attribute در نشت اطلاعات دیده شده است. رمز دیگری انتخاب کنید.',
    ],
    'attributes' => [
        'name' => 'نام و نام خانوادگی',
        'email' => 'ایمیل',
        'password' => 'رمز عبور',
        'password_confirmation' => 'تکرار رمز عبور',
    ],
];
