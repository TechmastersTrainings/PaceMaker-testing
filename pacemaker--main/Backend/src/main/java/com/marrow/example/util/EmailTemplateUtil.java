package com.marrow.example.util;

public class EmailTemplateUtil {

    public static String getWelcomeEmailTemplate(String name) {
        return "Dear " + name + ",\n\n" +
               "Welcome to PaceMaker! We are thrilled to have you on board.\n" +
               "Get ready to supercharge your medical learning experience with our premium QBank and expert video lectures.\n\n" +
               "Best Regards,\nPaceMaker Team";
    }

    public static String getPaymentConfirmationTemplate(Double amount, String plan) {
        return "Dear Student,\n\n" +
               "Thank you for your purchase!\n" +
               "We have successfully received your payment of INR " + amount + " for the " + plan + " Plan.\n" +
               "Your subscription is now fully active. Happy learning!\n\n" +
               "Best Regards,\nPaceMaker Team";
    }

    public static String getSubscriptionActivationTemplate(String plan) {
        return "Dear Student,\n\n" +
               "Great news! Your " + plan + " Plan has been successfully activated.\n" +
               "You now have access to all premium features associated with this tier.\n\n" +
               "Best Regards,\nPaceMaker Team";
    }

    public static String getNewsletterConfirmationTemplate() {
        return "Dear Subscriber,\n\n" +
               "Thank you for subscribing to the PaceMaker Medical High-Yields newsletter!\n\n" +
               "You will now receive weekly clinical summaries, diagnostic guides, and mock exam breakdowns delivered to your inbox.\n\n" +
               "Stay ahead in your medical journey!\n\n" +
               "Best Regards,\nPaceMaker Team";
    }
}
