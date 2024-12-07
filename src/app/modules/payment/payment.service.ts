import axios from "axios";
import { readFileSync } from "fs";
import { join } from "path";
import prisma from "../../utils/prisma";
import config from "../../config";

export const paymentService = {
  async initializePayment(
    userId: string,
    email: string,
    amount: number,
    shopId: string,
    orderId: string
  ): Promise<string> {
    const transactionId = `TXN-${Date.now()}`;

    // Log the amount being passed
    console.log("Initializing payment with amount:", amount);

    const payload = {
      store_id: config.store_id,
      signature_key: config.signature_key,
      cus_email: email,
      cus_phone: "0123456789",
      amount: amount, // Send BDT amount
      cus_name: "John Doe",
      tran_id: transactionId,
      currency: "BDT", // Set currency to BDT
      success_url: `https://e-commerce-backend-iota-pied.vercel.app/api/payment/confirmation?transactionId=${transactionId}&status=success`,
      fail_url: "http://www.merchantdomain.com/failedpage.html",
      cancel_url: "http://www.merchantdomain.com/cancelpage.html",
      desc: orderId,
      type: "json",
    };
    // Log the payload being sent
    console.log("Payload sent to payment gateway:", payload);

    try {
      const response = await axios.post(config.payment_url as string, payload);

      // Log the response from the payment gateway
      console.log("Response from Payment Gateway:", response.data);

      if (response.data.result === "true") {
        const { payment_url } = response.data;

        // Create a payment entry in the database
        await prisma.payment.create({
          data: {
            userId,
            amount,
            status: "PENDING",
            transactionId: transactionId,
            shopId,
            orderId,
          },
        });

        return payment_url;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error) {
      console.error("Payment initialization failed:", error);
      throw new Error("Payment initialization failed");
    }
  },
};

const verifyPayment = async (transactionId: string) => {
  try {
    const response = await axios.get(config.payment_verify_url!, {
      params: {
        store_id: config.store_id,
        signature_key: config.signature_key,
        type: "json",
        request_id: transactionId,
      },
    });

    console.log("Payment verification response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Payment validation failed:", err);
    throw new Error("Payment validation failed!");
  }
};

const confirmationService = async (transactionId: string, status: string) => {
  const verifyResponse = await verifyPayment(transactionId);

  console.log("Verify Response:", verifyResponse);

  let message = "";
  let amountInBdt = verifyResponse.converted_amount || 0; // Adjust if the response has a field for the converted amount

  if (verifyResponse && verifyResponse.pay_status === "Successful") {
    const paymentUpdateResult = await prisma.payment.update({
      where: { transactionId: transactionId },
      data: { status: "SUCCESS" },
    });

    await prisma.order.update({
      where: { id: paymentUpdateResult.orderId! },
      data: { status: "PROCESSING" },
    });

    if (!paymentUpdateResult) {
      throw new Error("Failed to update payment status");
    }

    message = `Successfully Paid! Amount in BDT: ${amountInBdt}`;
  } else {
    message = "Payment Failed!";
  }

  const filePath = join(__dirname, "../../../../public/confirmation.html");
  let template = readFileSync(filePath, "utf-8");

  template = template.replace("{{message}}", message);
  template = template.replace("{{amountInBdt}}", amountInBdt.toString());

  return template;
};

export const paymentServices = {
  confirmationService,
};
