import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const shippingAddressSchema = z.object({
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(7, "Enter a valid phone number"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  stock: z.coerce.number().min(0, "Stock must be positive"),
  images: z.array(z.string()).default([]),
  variants: z
    .array(z.object({ name: z.string().min(1), value: z.string().min(1) }))
    .default([]),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const reviewSchema = z.object({
  product: z.string().min(1, "Product is required"),
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5, "Rating must be 1-5"),
  comment: z.string().max(1000, "Comment is too long").optional(),
});
