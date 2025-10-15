<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    protected $fillable = [
        'name', 
        'email', 
        'password', 
        'remember_token',
        'two_factor_code',
        'two_factor_expires_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'two_factor_code',
        'remember_token'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'two_factor_expires_at' => 'datetime',
    ];

    public $timestamps = true;

    public function isEmailVerified()
    {
        return !is_null($this->email_verified_at);
    }
}