"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { reviewSchema } from "@/lib/validation";
import Button from "@/components/ui/Button";
import { StarIcon } from "@/components/ui/icons";

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
          /* radiogroup, not five loose buttons: picking a rating is one choice
             out of five, and aria-checked is what conveys the current pick. */
          <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={star === field.value}
                onClick={() => field.onChange(star)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-surface-muted ${
                  star <= field.value ? "text-rating" : "text-line-strong"
                }`}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <StarIcon className="h-6 w-6 fill-current" />
              </button>
            ))}
          </div>
        )}
      />
      {errors.rating && (
        <p role="alert" className="text-xs font-medium text-danger">
          {errors.rating.message}
        </p>
      )}

      <label htmlFor="review-comment" className="sr-only">
        Your review
      </label>
      <textarea
        id="review-comment"
        rows={3}
        placeholder="Share your thoughts about this product (optional)"
        className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-text transition-colors placeholder:text-text-subtle hover:border-text-subtle"
        {...register("comment")}
      />
      {errors.comment && (
        <p role="alert" className="text-xs font-medium text-danger">
          {errors.comment.message}
        </p>
      )}

      {/* The button reports its own busy state now, so the label can stay put
          instead of changing out from under the reader mid-submit. */}
      <Button type="submit" loading={submitting} className="self-start">
        {existingReview ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
