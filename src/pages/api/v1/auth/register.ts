import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!req.body.email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!req.body.password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const { email, password } = req.body;

    const { data } = await axios.post(`${process.env.A0_ISSUER_BASE_URL}/dbconnections/signup`, {
      client_id: process.env.A0_CLIENT_ID,
      email,
      password,
      connection: "Username-Password-Authentication",
    });

    return res.status(200).json({ data });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Assert that the error is an Axios error and access the response safely
      return res.status(error.response?.status || 500).json({ 
        error: error.response?.data.policy || "An unexpected error occurred" 
      });
    } else {
      // Handle non-Axios errors
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
}
