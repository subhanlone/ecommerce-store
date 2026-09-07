import { z } from "zod";
import { COUNTRY, PK_PROVINCES } from "@/lib/constants";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier");

const cloudinaryImageSchema = z
  .url("Image must be a valid URL")
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  }, "Images must use a secure Cloudinary URL");

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

/*
  Shipping address — Pakistan only.

  Previously every field was a free-text `min(1)`, so "State: asdf" and
  "Postal code: x" both passed and landed on an order the courier has to
  action. These are the real domestic formats:

  - province must be one of the seven the country actually has
  - Pakistan Post uses a five-digit code (Lahore 54000, Islamabad 44000)
  - mobiles are 03xx-xxxxxxx, or +923xx-xxxxxxx in international form
*/
export const shippingAddressSchema = z.object({
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.enum(PK_PROVINCES, { message: "Select a province" }),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Postal code must be 5 digits (e.g. 54000)"),
  // Accepts 03001234567, +923001234567, and the spaced/dashed forms people
  // actually type; stored normalised by the transform below.
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^(?:\+92|0)3\d{9}$/, "Enter a Pakistani mobile, e.g. 0300 1234567")
    ),
  // Fixed rather than typed: the store does not ship outside Pakistan, so a
  // free-text country field only invites an address that cannot be fulfilled.
  country: z.literal(COUNTRY).default(COUNTRY),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(5000),
  price: z.coerce.number().int().min(0, "Price must be positive"),
  category: objectIdSchema,
  stock: z.coerce.number().int().min(0, "Stock must be positive"),
  images: z.array(cloudinaryImageSchema).max(8).default([]),
  variants: z
    .array(z.object({
      name: z.string().trim().min(1).max(100),
      value: z.string().trim().min(1).max(100),
    }))
    .max(30)
    .default([]),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const reviewSchema = z.object({
  product: objectIdSchema,
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5, "Rating must be 1-5"),
  comment: z.string().trim().max(1000, "Comment is too long").optional(),
});

export const cartStateSchema = z.object({
  items: z.array(z.object({
    productId: objectIdSchema,
    qty: z.coerce.number().int().min(1).max(999),
  })).max(200),
});

export const wishlistStateSchema = z.object({
  items: z.array(z.object({ productId: objectIdSchema })).max(500),
});
