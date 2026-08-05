"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { reviewSchema } from "@/lib/validation";
import Button from "@/components/ui/Button";

export default function ReviewForm({ productId, existingReview }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      product: productId,
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || "",
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(result.error || "Could not submit review");
      return;
    }

    toast.success(existingReview ? "Review updated" : "Review submitted");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => field.onChange(star)}
                className={`text-2xl leading-none ${
                  star <= field.value ? "text-amber-500" : "text-neutral-300"
                }`}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
        )}
      />
      {errors.rating && <p className="text-xs text-red-600">{errors.rating.message}</p>}

      <textarea
        rows={3}
        placeholder="Share your thoughts about this product (optional)"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        {...register("comment")}
      />
      {errors.comment && <p className="text-xs text-red-600">{errors.comment.message}</p>}

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
}
