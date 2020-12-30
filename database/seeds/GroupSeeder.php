<?php

use App\Customer;
use App\Group;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    Group::create([ // ID 1
      'name' => 'Developer',
      'customer_id' => 1,
    ]);

    Group::create([ // ID 2
      'name' => 'Airframe Mechanic',
      'description' => 'Minus quia quisquam qui et accusamus. Quisquam perspiciatis dolorem libero laudantium ut sint hic. Rem at ratione ipsum eaque voluptatem.',
      'customer_id' => 1,
    ]);

    Group::create([ // ID 3
      'name' => 'Carpenter',
      'description' => 'Nostrum dignissimos velit aliquid expedita. Est ut quia tempora animi vel veniam. Voluptatum vitae et rem velit et.',
      'customer_id' => 1,
    ]);
    Group::create([ // ID 4
      'name' => 'Construction Laborer',
      'description' => 'Quaerat totam non eum possimus velit. Ipsa eligendi debitis qui praesentium quia quod. Repellendus voluptas et laudantium vitae voluptas.',
      'customer_id' => 1,
    ]);
    Group::create([ // ID 5
      'name' => 'HR Manager',
      'description' => 'Odio ex sed molestias non maiores reiciendis. Dolor eaque dolorem dolor eius qui. Exercitationem saepe earum architecto architecto assumenda dolore. Maxime qui eveniet doloribus aut id est.',
      'customer_id' => 1,
    ]);
    Group::create([ // ID 6
      'name' => 'Medical Laboratory Technologist',
      'description' => 'Repudiandae veniam voluptas quia. Voluptas quidem non illum aperiam. Nesciunt esse impedit aut ipsam. Molestiae ex est inventore soluta dolor nostrum est.',
      'customer_id' => 1,
    ]);
    Group::create([ // ID 7
      'name' => 'Artist',
      'description' => 'Eos voluptatibus quod saepe. Temporibus maxime ut ex error. Ullam maiores voluptas rem eius doloribus quia facilis. Sed quo perferendis magnam dolor in velit qui.',
      'customer_id' => 1,
    ]);
    Group::create([ // ID 8
      'name' => 'Rental Clerk',
      'description' => 'Quam ex qui sint repellat. Et ipsa quibusdam asperiores debitis soluta. Voluptatem consequuntur ab aut architecto.',
      'customer_id' => 1,
    ]);
    Group::create([ // ID 9
      'name' => 'Biological Scientist',
      'description' => 'Vel et sed fugiat fuga nam quo. Provident mollitia ea cumque provident enim. Et harum illo dolorum. Accusamus consectetur officiis a fugiat.',
      'customer_id' => 1,
    ]);
    Group::create([ // ID 10
      'name' => 'Medical Records Technician',
      'description' => 'Similique repellendus nihil non quod. Alias quo occaecati molestiae deleniti quos. Consequatur aut quia quidem vitae. Quasi optio nostrum ut sed aliquid.',
      'customer_id' => 1,
    ]);
    Group::create([ // ID 11
      'name' => 'Travel Clerk',
      'description' => 'Expedita ratione illum voluptatem molestias quod. Amet asperiores temporibus expedita ut assumenda. Sit omnis explicabo rem minus sint consectetur labore.',
      'customer_id' => 1,
    ]);
    Group::create([ // ID 12
      'name' => 'Special Services Dept.',
      'customer_id' => 1,
    ]);
  }
}
