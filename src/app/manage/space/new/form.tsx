"use client";

import { blockedSlugs, maxLength, minLength, validSlugRegex } from "@/lib/blockedslugs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export function NewSpaceForm() {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setError } = useForm();
    const router = useRouter();

    const slug = watch("slug");

    return <form className="w-full h-screen p-4 flex flex-col justify-center items-center" onSubmit={handleSubmit(async values => {
        const response = await fetch("/api/space", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                slug: values.slug.toLowerCase(),
            }),
        });

        if (response.status === 409) {
            setError("slug", {
                type: "manual",
                message: "That slug is taken.",
            });
            return;
        }

        if (!response.ok) {
            setError("slug", {
                type: "manual",
                message: "An unknown error occurred.",
            });
            return;
        }

        router.refresh();
        router.push(`/manage/space/${encodeURIComponent(values.slug)}`);
    })}>
        <div className="text-center text-blue-500 mb-4 text-8xl">
            <i className="bi bi-stack" />
        </div>
        <h1 className="font-bold text-3xl text-center w-fit mb-2">Let&rsquo;s create a space</h1>
        <p className="text-center">Your links live in spaces. Let&rsquo;s make one.</p>

        <div className="mt-8 flex items-stretch">
            <input type="text" placeholder="Give it a slug..." className="block w-full max-w-md px-4 py-2 rounded-l-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-blue-500 placeholder:text-neutral-500 border-r-0" {...register("slug", {
                required: "A slug is required.",
                validate: value => {
                    const resolvedSlug = value.toLowerCase();
                    if (!validSlugRegex.test(resolvedSlug)) return "Slugs must only contain letters, numbers, dashes, and underscores.";
                    if (blockedSlugs.includes(resolvedSlug)) return "That slug is reserved.";
                    return true;
                },
                minLength: {
                    value: minLength,
                    message: `Slugs must be at least ${minLength} characters long.`,
                },
                maxLength: {
                    value: maxLength,
                    message: `Slugs must be at most ${maxLength} characters long.`,
                },
            })} />
            <button type="submit" className="px-4 py-2 rounded-r-lg bg-blue-500 text-white font-bold hover:bg-blue-600 focus:bg-blue-600 active:bg-blue-700 disabled:pointer-events-none disabled:opacity-50" disabled={isSubmitting}>Create</button>
        </div>

        {errors.slug && <div className="mt-1 text-red-500 text-sm text-center">{typeof errors.slug.message === "string" ? errors.slug.message : "Generic form validation error"}</div>}
        {!errors.slug && <div className="mt-1 text-neutral-500 text-sm text-center">Scoped links will be located at <strong>https://sketchy.dev/@{slug || "[your-slug-here]"}</strong></div>}
    </form>;
}