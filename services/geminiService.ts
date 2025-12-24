import { GoogleGenAI } from "@google/genai";
import { PaymentRecord, Tenant } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generatePaymentReminder = async (record: PaymentRecord, daysOverdue: number): Promise<string> => {
  if (!apiKey) return "API Key is missing. Please configure your Gemini API Key.";

  try {
    const prompt = `
      You are a polite but professional property manager assistant in Taiwan.
      Write a short, polite, but firm rent payment reminder message (in Traditional Chinese) to a tenant.
      
      Tenant Name: ${record.tenantName}
      Amount Due: ${record.amount} TWD
      Due Date: ${record.dueDate}
      Days Overdue: ${daysOverdue}
      
      The message should be suitable for sending via LINE or SMS.
      Include a greeting, the details of the outstanding payment, and a request to pay as soon as possible.
      Keep it under 100 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "無法生成訊息。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "生成訊息時發生錯誤。";
  }
};

export const analyzeFinancialHealth = async (payments: PaymentRecord[]): Promise<string> => {
  if (!apiKey) return "API Key is missing.";

  try {
    const dataSummary = JSON.stringify(payments.map(p => ({
      status: p.status,
      amount: p.amount,
      date: p.dueDate
    })));

    const prompt = `
      Act as a financial analyst for a landlord in Taiwan.
      Analyze the following rent payment data (JSON format):
      ${dataSummary}
      
      Please provide a brief summary (in Traditional Chinese) covering:
      1. Total collection rate (percentage of paid vs total).
      2. Any concerning trends (e.g., specific frequent delays).
      3. Actionable advice for the landlord to improve cash flow.
      
      Keep it concise, bullet points, professional tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "無法進行分析。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "分析時發生錯誤。";
  }
};