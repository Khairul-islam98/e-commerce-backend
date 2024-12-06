import axios from "axios";
import { readFileSync } from "fs";
import { join } from "path";
import prisma from "../../utils/prisma";
import config from "../../config";

export const paymentService = {
  async initializePayment(
    userId: string,
    email: string,
    amount: number
  ): Promise<string> {
    const transactionId = `TXN-${Date.now()}`;

    const payload = {
      store_id: config.store_id,
      signature_key: config.signature_key,
      cus_email: email,
      cus_phone: "0123456789",
      amount: amount,
      cus_name: "John Doe",
      tran_id: transactionId,
      currency: "USD",
      success_url: `https://tech-tips-hub-backend.vercel.app/api/payment/confirmation?transactionId=${transactionId}&status=success`,
      fail_url: `https://tech-tips-hub-backend.vercel.app/api/payment/confirmation?transactionId=${transactionId}&status=failed`,
      cancel_url: `https://tech-tips-hub-backend.vercel.app/api/payment/confirmation?transactionId=${transactionId}&status=cancelled`,
      desc: userId,
      type: "json",
    };

    try {
      const response = await axios.post(config.payment_url as string, payload);

      if (response.data.result === "true") {
        const { payment_url } = response.data;

        // Create a payment entry in the database
        await prisma.payment.create({
          data: {
            userId: userId,
            amount: amount,
            status: "PENDING",
            transactionId: transactionId,
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

    return response.data;
  } catch (err) {
    console.error("Payment validation failed:", err);
    throw new Error("Payment validation failed!");
  }
};

const confirmationService = async (transactionId: string, status: string) => {
  try {
    // Step 1: Verify the payment
    const verifyResponse = await verifyPayment(transactionId);

    if (!verifyResponse || verifyResponse.pay_status !== "Successful") {
      throw new Error(
        "Payment verification failed or payment was not successful."
      );
    }

    // Step 2: Update payment status in the database
    const paymentRecord = await prisma.payment.updateMany({
      where: { transactionId },
      data: { status: "SUCCESS" },
    });

    if (!paymentRecord) {
      throw new Error("Payment record update failed.");
    }

    // Step 3: Update product stock
    const productId = verifyResponse.product_id;
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.stock <= 0) {
      throw new Error("Product is out of stock or unavailable.");
    }

    await prisma.product.update({
      where: { id: productId },
      data: { stock: product.stock - 1 },
    });

    // Step 4: Log successful payment and prepare confirmation message
    const message = `Your payment with Transaction ID: ${transactionId} was successful!`;

    const filePath = join(__dirname, "../../../../public/confirmation.html");
    let template = readFileSync(filePath, "utf-8");

    template = template.replace("{{message}}", message);

    return template;
  } catch (error) {
    console.error("Confirmation service error:", error);
    throw new Error("Confirmation service failed.");
  }
};

export const paymentServices = {
  initializePayment: paymentService.initializePayment,
  confirmationService,
};
