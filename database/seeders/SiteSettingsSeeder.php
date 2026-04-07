<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SiteSetting;

class SiteSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Homepage Settings
            ['key' => 'homepage_title', 'category' => 'homepage', 'type' => 'text', 'value' => 'Welcome to Sanctuario De Carmona Memorial Park', 'label' => 'Homepage Title', 'description' => 'Main title displayed on the homepage hero section', 'is_active' => true, 'sort_order' => 1],
            ['key' => 'homepage_subtitle', 'category' => 'homepage', 'type' => 'textarea', 'value' => 'Your sanctuary for peace and tranquility in the heart of Cavite', 'label' => 'Homepage Subtitle', 'description' => 'Subtitle text displayed below the main title', 'is_active' => true, 'sort_order' => 2],
            ['key' => 'homepage_hero_image', 'category' => 'homepage', 'type' => 'image', 'value' => 'assets/images/pic7.jpg', 'label' => 'Hero Background Image', 'description' => 'Background image for the homepage hero section', 'is_active' => true, 'sort_order' => 3],
            
            // About Settings
            ['key' => 'about_title', 'category' => 'about', 'type' => 'text', 'value' => 'Who We Are', 'label' => 'About Section Title', 'description' => 'Title for the about section on homepage', 'is_active' => true, 'sort_order' => 1],
            ['key' => 'about_description', 'category' => 'about', 'type' => 'textarea', 'value' => 'Sanctuario De Carmona Memorial Park is a peaceful sanctuary dedicated to honoring the memory of your loved ones. With over a decade of experience, we provide compassionate care and professional services in a serene environment.', 'label' => 'About Description', 'description' => 'Main description text for the about section', 'is_active' => true, 'sort_order' => 2],
            
            // Contact Settings
            ['key' => 'contact_phone', 'category' => 'contact', 'type' => 'text', 'value' => '+63 912 345 6789', 'label' => 'Phone Number', 'description' => 'Main contact phone number', 'is_active' => true, 'sort_order' => 1],
            ['key' => 'contact_email', 'category' => 'contact', 'type' => 'email', 'value' => 'info@sanctuario.com', 'label' => 'Email Address', 'description' => 'Main contact email address', 'is_active' => true, 'sort_order' => 2],
            ['key' => 'contact_address', 'category' => 'contact', 'type' => 'textarea', 'value' => 'Sanctuario De Carmona Memorial Park, Carmona, Cavite, Philippines', 'label' => 'Address', 'description' => 'Physical address of the memorial park', 'is_active' => true, 'sort_order' => 3],
            
            // Services Settings
            ['key' => 'services_title', 'category' => 'services', 'type' => 'text', 'value' => 'Our Products & Services', 'label' => 'Services Section Title', 'description' => 'Title for the services section', 'is_active' => true, 'sort_order' => 1],
            ['key' => 'services_description', 'category' => 'services', 'type' => 'textarea', 'value' => 'At Sanctuario De Carmona Memorial Park, we provide comprehensive memorial products and services designed to honor your loved ones with dignity and respect.', 'label' => 'Services Description', 'description' => 'Description text for the services section', 'is_active' => true, 'sort_order' => 2],
            
            // Footer Settings
            ['key' => 'footer_company_name', 'category' => 'footer', 'type' => 'text', 'value' => 'Sanctuario De Carmona Memorial Park', 'label' => 'Company Name', 'description' => 'Company name displayed in footer', 'is_active' => true, 'sort_order' => 1],
            ['key' => 'footer_copyright_text', 'category' => 'footer', 'type' => 'text', 'value' => '© 2024 Sanctuario De Carmona Memorial Park. All rights reserved.', 'label' => 'Copyright Text', 'description' => 'Copyright notice displayed in footer', 'is_active' => true, 'sort_order' => 2],
            ['key' => 'footer_description', 'category' => 'footer', 'type' => 'textarea', 'value' => 'A peaceful sanctuary dedicated to honoring the memory of your loved ones with compassionate care and professional services.', 'label' => 'Footer Description', 'description' => 'Short description displayed in footer', 'is_active' => true, 'sort_order' => 3],
            ['key' => 'footer_logo', 'category' => 'footer', 'type' => 'image', 'value' => 'assets/images/Sanctuario_Logo_Good.png', 'label' => 'Footer Logo', 'description' => 'Logo displayed in footer', 'is_active' => true, 'sort_order' => 4],
            
            // Social Media Settings
            ['key' => 'social_facebook', 'category' => 'social', 'type' => 'text', 'value' => 'https://facebook.com/sanctuario', 'label' => 'Facebook URL', 'description' => 'Facebook page link', 'is_active' => true, 'sort_order' => 1],
            ['key' => 'social_twitter', 'category' => 'social', 'type' => 'text', 'value' => 'https://twitter.com/sanctuario', 'label' => 'Twitter URL', 'description' => 'Twitter profile link', 'is_active' => true, 'sort_order' => 2],
            ['key' => 'social_instagram', 'category' => 'social', 'type' => 'text', 'value' => 'https://instagram.com/sanctuario', 'label' => 'Instagram URL', 'description' => 'Instagram profile link', 'is_active' => true, 'sort_order' => 3],
            ['key' => 'social_youtube', 'category' => 'social', 'type' => 'text', 'value' => 'https://youtube.com/sanctuario', 'label' => 'YouTube URL', 'description' => 'YouTube channel link', 'is_active' => true, 'sort_order' => 4],
            ['key' => 'social_linkedin', 'category' => 'social', 'type' => 'text', 'value' => 'https://linkedin.com/company/sanctuario', 'label' => 'LinkedIn URL', 'description' => 'LinkedIn company page link', 'is_active' => true, 'sort_order' => 5],
            
            // General Settings
            ['key' => 'site_name', 'category' => 'general', 'type' => 'text', 'value' => 'Sanctuario De Carmona Memorial Park', 'label' => 'Site Name', 'description' => 'Main site name', 'is_active' => true, 'sort_order' => 1],
            ['key' => 'site_tagline', 'category' => 'general', 'type' => 'text', 'value' => 'A Sanctuary for Peace and Remembrance', 'label' => 'Site Tagline', 'description' => 'Short tagline for the site', 'is_active' => true, 'sort_order' => 2],
            ['key' => 'site_logo', 'category' => 'general', 'type' => 'image', 'value' => 'assets/images/Sanctuario_Logo_Good.png', 'label' => 'Site Logo', 'description' => 'Main site logo', 'is_active' => true, 'sort_order' => 3],
            ['key' => 'site_favicon', 'category' => 'general', 'type' => 'image', 'value' => 'assets/images/main_icon.jpg', 'label' => 'Site Favicon', 'description' => 'Browser tab icon', 'is_active' => true, 'sort_order' => 4],
            ['key' => 'maintenance_mode', 'category' => 'general', 'type' => 'text', 'value' => 'false', 'label' => 'Maintenance Mode', 'description' => 'Set to true to enable maintenance mode (true/false)', 'is_active' => true, 'sort_order' => 5],
            ['key' => 'site_description', 'category' => 'general', 'type' => 'textarea', 'value' => 'Sanctuario De Carmona Memorial Park - A peaceful sanctuary dedicated to honoring the memory of your loved ones.', 'label' => 'Site Meta Description', 'description' => 'SEO meta description for search engines', 'is_active' => true, 'sort_order' => 6],
            
            // About Section Extended
            ['key' => 'about_story_title', 'category' => 'about', 'type' => 'text', 'value' => 'Our Story', 'label' => 'Story Section Title', 'description' => 'Title for the story section', 'is_active' => true, 'sort_order' => 3],
            ['key' => 'about_story_content', 'category' => 'about', 'type' => 'textarea', 'value' => 'Founded in 2024, Sanctuario De Carmona Memorial Park has been a beacon of peace and tranquility in the heart of Cavite. Our journey began with a simple mission: to create a space where people can find solace, healing, and spiritual growth.', 'label' => 'Story Content', 'description' => 'Content for the story section', 'is_active' => true, 'sort_order' => 4],
            ['key' => 'about_mission_title', 'category' => 'about', 'type' => 'text', 'value' => 'Our Mission', 'label' => 'Mission Section Title', 'description' => 'Title for the mission section', 'is_active' => true, 'sort_order' => 5],
            ['key' => 'about_mission_content', 'category' => 'about', 'type' => 'textarea', 'value' => 'We are dedicated to providing a sanctuary where individuals can connect with their inner selves, find peace in nature, and experience spiritual renewal. Through our various programs and services, we aim to foster personal growth and community well-being.', 'label' => 'Mission Content', 'description' => 'Content for the mission section', 'is_active' => true, 'sort_order' => 6],
            ['key' => 'about_values_title', 'category' => 'about', 'type' => 'text', 'value' => 'Our Values', 'label' => 'Values Section Title', 'description' => 'Title for the values section', 'is_active' => true, 'sort_order' => 7],
            
            // Services Extended
            ['key' => 'services_cta_text', 'category' => 'services', 'type' => 'text', 'value' => 'Explore Our Services', 'label' => 'Services CTA Button Text', 'description' => 'Text for the services call-to-action button', 'is_active' => true, 'sort_order' => 3],
            
            // Contact Extended
            ['key' => 'contact_title', 'category' => 'contact', 'type' => 'text', 'value' => 'Contact Us', 'label' => 'Contact Page Title', 'description' => 'Title for the contact page', 'is_active' => true, 'sort_order' => 4],
            ['key' => 'contact_location_title', 'category' => 'contact', 'type' => 'text', 'value' => 'Location', 'label' => 'Location Card Title', 'description' => 'Title for the location info card', 'is_active' => true, 'sort_order' => 5],
            ['key' => 'contact_hours_title', 'category' => 'contact', 'type' => 'text', 'value' => 'Business Hours', 'label' => 'Business Hours Card Title', 'description' => 'Title for the business hours card', 'is_active' => true, 'sort_order' => 6],
            ['key' => 'contact_hours_content', 'category' => 'contact', 'type' => 'textarea', 'value' => 'Our team is available every day from Monday to Sunday, 8:00 AM to 5:00 PM, ready to provide respectful and reliable grave cleaning services.', 'label' => 'Business Hours Content', 'description' => 'Content for business hours', 'is_active' => true, 'sort_order' => 7],
            ['key' => 'contact_cta_text', 'category' => 'contact', 'type' => 'text', 'value' => 'Send Message', 'label' => 'Contact Form Submit Button', 'description' => 'Text for the contact form submit button', 'is_active' => true, 'sort_order' => 8],
            
            // Footer Extended
            ['key' => 'footer_grief_support_title', 'category' => 'footer', 'type' => 'text', 'value' => 'A YEAR OF DAILY GRIEF SUPPORT', 'label' => 'Grief Support Section Title', 'description' => 'Title for the grief support section', 'is_active' => true, 'sort_order' => 5],
            ['key' => 'footer_grief_support_text', 'category' => 'footer', 'type' => 'textarea', 'value' => 'Our support in your time of need does not end after the funeral services. Enter your email below to receive a grief support message from us each day for a year. You can unsubscribe at any time.', 'label' => 'Grief Support Text', 'description' => 'Text for the grief support section', 'is_active' => true, 'sort_order' => 6],
            ['key' => 'footer_location_title', 'category' => 'footer', 'type' => 'text', 'value' => 'OUR LOCATION', 'label' => 'Footer Location Title', 'description' => 'Title for the location section in footer', 'is_active' => true, 'sort_order' => 7],
            ['key' => 'footer_location_address', 'category' => 'footer', 'type' => 'textarea', 'value' => 'Memorial Park, Calumpang Rd, Carmona, 4116 Cavite', 'label' => 'Footer Address', 'description' => 'Address displayed in footer', 'is_active' => true, 'sort_order' => 8],
            ['key' => 'footer_phone', 'category' => 'footer', 'type' => 'text', 'value' => 'Tel: 1-888-881-6131', 'label' => 'Footer Phone', 'description' => 'Phone number in footer', 'is_active' => true, 'sort_order' => 9],
            ['key' => 'footer_fax', 'category' => 'footer', 'type' => 'text', 'value' => 'Fax: 1-617-949-5459', 'label' => 'Footer Fax', 'description' => 'Fax number in footer', 'is_active' => true, 'sort_order' => 10],
            
            // Navigation Settings
            ['key' => 'nav_home', 'category' => 'navigation', 'type' => 'text', 'value' => 'Home', 'label' => 'Home Link Text', 'description' => 'Text for home navigation link', 'is_active' => true, 'sort_order' => 1],
            ['key' => 'nav_products_services', 'category' => 'navigation', 'type' => 'text', 'value' => 'Products & Services', 'label' => 'Products & Services Link Text', 'description' => 'Text for products & services navigation link', 'is_active' => true, 'sort_order' => 2],
            ['key' => 'nav_about', 'category' => 'navigation', 'type' => 'text', 'value' => 'About us', 'label' => 'About Link Text', 'description' => 'Text for about navigation link', 'is_active' => true, 'sort_order' => 3],
            ['key' => 'nav_payments', 'category' => 'navigation', 'type' => 'text', 'value' => 'Payments', 'label' => 'Payments Link Text', 'description' => 'Text for payments navigation link', 'is_active' => true, 'sort_order' => 4],
            ['key' => 'nav_contact', 'category' => 'navigation', 'type' => 'text', 'value' => 'Contact us', 'label' => 'Contact Link Text', 'description' => 'Text for contact navigation link', 'is_active' => true, 'sort_order' => 5],
            ['key' => 'nav_blog', 'category' => 'navigation', 'type' => 'text', 'value' => 'Blogs', 'label' => 'Blog Link Text', 'description' => 'Text for blog navigation link', 'is_active' => true, 'sort_order' => 6],
            ['key' => 'nav_login', 'category' => 'navigation', 'type' => 'text', 'value' => 'Login', 'label' => 'Login Button Text', 'description' => 'Text for login button', 'is_active' => true, 'sort_order' => 7],
            ['key' => 'nav_signup', 'category' => 'navigation', 'type' => 'text', 'value' => 'Sign Up', 'label' => 'Sign Up Button Text', 'description' => 'Text for sign up button', 'is_active' => true, 'sort_order' => 8],
            
            // Dropdown Menu Settings
            ['key' => 'nav_dropdown_products', 'category' => 'navigation', 'type' => 'text', 'value' => 'Products', 'label' => 'Dropdown Products Title', 'description' => 'Title for products section in dropdown', 'is_active' => true, 'sort_order' => 9],
            ['key' => 'nav_dropdown_services', 'category' => 'navigation', 'type' => 'text', 'value' => 'Services', 'label' => 'Dropdown Services Title', 'description' => 'Title for services section in dropdown', 'is_active' => true, 'sort_order' => 10],
            ['key' => 'nav_lawn_lots', 'category' => 'navigation', 'type' => 'text', 'value' => 'Lawn Lots', 'label' => 'Lawn Lots Link Text', 'description' => 'Text for lawn lots link', 'is_active' => true, 'sort_order' => 11],
            ['key' => 'nav_family_estates', 'category' => 'navigation', 'type' => 'text', 'value' => 'Family Estates', 'label' => 'Family Estates Link Text', 'description' => 'Text for family estates link', 'is_active' => true, 'sort_order' => 12],
            ['key' => 'nav_columbariums', 'category' => 'navigation', 'type' => 'text', 'value' => 'Columbariums', 'label' => 'Columbariums Link Text', 'description' => 'Text for columbariums link', 'is_active' => true, 'sort_order' => 13],
            ['key' => 'nav_internment', 'category' => 'navigation', 'type' => 'text', 'value' => 'Interment', 'label' => 'Interment Link Text', 'description' => 'Text for interment link', 'is_active' => true, 'sort_order' => 14],
            ['key' => 'nav_cremation', 'category' => 'navigation', 'type' => 'text', 'value' => 'Cremation', 'label' => 'Cremation Link Text', 'description' => 'Text for cremation link', 'is_active' => true, 'sort_order' => 15],
            ['key' => 'nav_maintenance', 'category' => 'navigation', 'type' => 'text', 'value' => 'Maintenance', 'label' => 'Maintenance Link Text', 'description' => 'Text for maintenance link', 'is_active' => true, 'sort_order' => 16],
            
            // Mobile Menu Settings
            ['key' => 'mobile_menu_our_team', 'category' => 'navigation', 'type' => 'text', 'value' => 'Our Team', 'label' => 'Our Team Link Text', 'description' => 'Text for our team link in mobile menu', 'is_active' => true, 'sort_order' => 17],
            ['key' => 'mobile_menu_privacy', 'category' => 'navigation', 'type' => 'text', 'value' => 'Privacy Policy', 'label' => 'Privacy Policy Link Text', 'description' => 'Text for privacy policy link in mobile menu', 'is_active' => true, 'sort_order' => 18],
            ['key' => 'mobile_menu_phone', 'category' => 'navigation', 'type' => 'text', 'value' => '0912-345-6789', 'label' => 'Mobile Menu Phone', 'description' => 'Phone number displayed in mobile menu', 'is_active' => true, 'sort_order' => 19],
            ['key' => 'mobile_menu_address', 'category' => 'navigation', 'type' => 'text', 'value' => 'Sanctuario De Carmona Memorial Park, Cavite, Philippines', 'label' => 'Mobile Menu Address', 'description' => 'Address displayed in mobile menu', 'is_active' => true, 'sort_order' => 20],
            
            // Profile Menu Settings
            ['key' => 'profile_menu_my_profile', 'category' => 'navigation', 'type' => 'text', 'value' => 'My Profile', 'label' => 'My Profile Menu Item', 'description' => 'Text for my profile menu item', 'is_active' => true, 'sort_order' => 21],
            ['key' => 'profile_menu_maintenance', 'category' => 'navigation', 'type' => 'text', 'value' => 'My Maintenance Requests', 'label' => 'Maintenance Requests Menu Item', 'description' => 'Text for maintenance requests menu item', 'is_active' => true, 'sort_order' => 22],
            ['key' => 'profile_menu_billing', 'category' => 'navigation', 'type' => 'text', 'value' => 'Billing & Payments', 'label' => 'Billing Menu Item', 'description' => 'Text for billing menu item', 'is_active' => true, 'sort_order' => 23],
            ['key' => 'profile_menu_logout', 'category' => 'navigation', 'type' => 'text', 'value' => 'Logout', 'label' => 'Logout Menu Item', 'description' => 'Text for logout menu item', 'is_active' => true, 'sort_order' => 24],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Site settings seeded successfully!');
    }
}
