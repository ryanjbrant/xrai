// UIAnimations.cs - Reusable UI animation utilities
// Part of Spec 013: UI/UX Conferencing System - Phase 4 Polish
//
// Provides smooth animations for UI Toolkit elements using the experimental animation API.

using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace XRRAI.UI
{
    /// <summary>
    /// Reusable UI animation utilities for UI Toolkit elements.
    /// Uses experimental.animation API for smooth transitions.
    /// </summary>
    public static class UIAnimations
    {
        // Default animation settings
        public const int DefaultDurationMs = 300;
        public const int FastDurationMs = 150;
        public const int SlowDurationMs = 500;

        #region Fade Animations

        /// <summary>
        /// Fade in element from transparent to opaque.
        /// </summary>
        public static void FadeIn(VisualElement element, int durationMs = DefaultDurationMs, Action onComplete = null)
        {
            if (element == null) return;

            element.style.opacity = 0;
            element.style.display = DisplayStyle.Flex;

            element.experimental.animation
                .Start(0f, 1f, durationMs, (e, val) => e.style.opacity = val)
                .Ease(Easing.OutCubic)
                .OnCompleted(() => onComplete?.Invoke());
        }

        /// <summary>
        /// Fade out element from opaque to transparent.
        /// </summary>
        public static void FadeOut(VisualElement element, int durationMs = DefaultDurationMs, bool hideOnComplete = true, Action onComplete = null)
        {
            if (element == null) return;

            element.experimental.animation
                .Start(element.resolvedStyle.opacity, 0f, durationMs, (e, val) => e.style.opacity = val)
                .Ease(Easing.OutCubic)
                .OnCompleted(() =>
                {
                    if (hideOnComplete)
                        element.style.display = DisplayStyle.None;
                    onComplete?.Invoke();
                });
        }

        #endregion

        #region Scale Animations

        /// <summary>
        /// Scale in element with a bounce effect (good for buttons, modals).
        /// </summary>
        public static void ScaleIn(VisualElement element, int durationMs = DefaultDurationMs, Action onComplete = null)
        {
            if (element == null) return;

            element.style.scale = new Scale(Vector3.zero);
            element.style.opacity = 0;
            element.style.display = DisplayStyle.Flex;

            // Animate scale
            element.experimental.animation
                .Start(0f, 1f, durationMs, (e, val) =>
                {
                    // Overshoot for bounce effect
                    float overshoot = val > 0.8f ? 1f + (val - 0.8f) * 0.5f : val;
                    if (val > 0.9f) overshoot = 1f + (1f - val) * 0.5f;
                    e.style.scale = new Scale(new Vector3(overshoot, overshoot, 1f));
                    e.style.opacity = Mathf.Clamp01(val * 2f);
                })
                .Ease(Easing.OutCubic)
                .OnCompleted(() =>
                {
                    element.style.scale = new Scale(Vector3.one);
                    onComplete?.Invoke();
                });
        }

        /// <summary>
        /// Scale out element to zero.
        /// </summary>
        public static void ScaleOut(VisualElement element, int durationMs = FastDurationMs, bool hideOnComplete = true, Action onComplete = null)
        {
            if (element == null) return;

            element.experimental.animation
                .Start(1f, 0f, durationMs, (e, val) =>
                {
                    e.style.scale = new Scale(new Vector3(val, val, 1f));
                    e.style.opacity = val;
                })
                .Ease(Easing.InCubic)
                .OnCompleted(() =>
                {
                    if (hideOnComplete)
                        element.style.display = DisplayStyle.None;
                    onComplete?.Invoke();
                });
        }

        /// <summary>
        /// Pulse animation (scales up slightly then back).
        /// </summary>
        public static void Pulse(VisualElement element, float scale = 1.1f, int durationMs = 200)
        {
            if (element == null) return;

            element.experimental.animation
                .Start(1f, scale, durationMs / 2, (e, val) =>
                {
                    e.style.scale = new Scale(new Vector3(val, val, 1f));
                })
                .Ease(Easing.OutCubic)
                .OnCompleted(() =>
                {
                    element.experimental.animation
                        .Start(scale, 1f, durationMs / 2, (e, val) =>
                        {
                            e.style.scale = new Scale(new Vector3(val, val, 1f));
                        })
                        .Ease(Easing.InCubic);
                });
        }

        #endregion

        #region Slide Animations

        /// <summary>
        /// Slide in from left.
        /// </summary>
        public static void SlideInFromLeft(VisualElement element, float distance = 100f, int durationMs = DefaultDurationMs, Action onComplete = null)
        {
            if (element == null) return;

            element.style.translate = new Translate(-distance, 0);
            element.style.opacity = 0;
            element.style.display = DisplayStyle.Flex;

            element.experimental.animation
                .Start(0f, 1f, durationMs, (e, val) =>
                {
                    e.style.translate = new Translate(-distance * (1f - val), 0);
                    e.style.opacity = val;
                })
                .Ease(Easing.OutCubic)
                .OnCompleted(() => onComplete?.Invoke());
        }

        /// <summary>
        /// Slide in from right.
        /// </summary>
        public static void SlideInFromRight(VisualElement element, float distance = 100f, int durationMs = DefaultDurationMs, Action onComplete = null)
        {
            if (element == null) return;

            element.style.translate = new Translate(distance, 0);
            element.style.opacity = 0;
            element.style.display = DisplayStyle.Flex;

            element.experimental.animation
                .Start(0f, 1f, durationMs, (e, val) =>
                {
                    e.style.translate = new Translate(distance * (1f - val), 0);
                    e.style.opacity = val;
                })
                .Ease(Easing.OutCubic)
                .OnCompleted(() => onComplete?.Invoke());
        }

        /// <summary>
        /// Slide in from bottom (common for modals, toasts).
        /// </summary>
        public static void SlideInFromBottom(VisualElement element, float distance = 50f, int durationMs = DefaultDurationMs, Action onComplete = null)
        {
            if (element == null) return;

            element.style.translate = new Translate(0, distance);
            element.style.opacity = 0;
            element.style.display = DisplayStyle.Flex;

            element.experimental.animation
                .Start(0f, 1f, durationMs, (e, val) =>
                {
                    e.style.translate = new Translate(0, distance * (1f - val));
                    e.style.opacity = val;
                })
                .Ease(Easing.OutCubic)
                .OnCompleted(() => onComplete?.Invoke());
        }

        /// <summary>
        /// Slide in from top.
        /// </summary>
        public static void SlideInFromTop(VisualElement element, float distance = 50f, int durationMs = DefaultDurationMs, Action onComplete = null)
        {
            if (element == null) return;

            element.style.translate = new Translate(0, -distance);
            element.style.opacity = 0;
            element.style.display = DisplayStyle.Flex;

            element.experimental.animation
                .Start(0f, 1f, durationMs, (e, val) =>
                {
                    e.style.translate = new Translate(0, -distance * (1f - val));
                    e.style.opacity = val;
                })
                .Ease(Easing.OutCubic)
                .OnCompleted(() => onComplete?.Invoke());
        }

        /// <summary>
        /// Slide out to bottom.
        /// </summary>
        public static void SlideOutToBottom(VisualElement element, float distance = 50f, int durationMs = FastDurationMs, bool hideOnComplete = true, Action onComplete = null)
        {
            if (element == null) return;

            element.experimental.animation
                .Start(0f, 1f, durationMs, (e, val) =>
                {
                    e.style.translate = new Translate(0, distance * val);
                    e.style.opacity = 1f - val;
                })
                .Ease(Easing.InCubic)
                .OnCompleted(() =>
                {
                    if (hideOnComplete)
                        element.style.display = DisplayStyle.None;
                    onComplete?.Invoke();
                });
        }

        #endregion

        #region Shake Animation

        /// <summary>
        /// Shake animation for errors/validation feedback.
        /// </summary>
        public static void Shake(VisualElement element, float intensity = 10f, int durationMs = 400)
        {
            if (element == null) return;

            int steps = 6;
            int stepDuration = durationMs / steps;
            int currentStep = 0;

            void AnimateStep()
            {
                if (currentStep >= steps)
                {
                    element.style.translate = new Translate(0, 0);
                    return;
                }

                float offset = (currentStep % 2 == 0 ? 1 : -1) * intensity * (1f - (float)currentStep / steps);

                element.experimental.animation
                    .Start(element.resolvedStyle.translate.x.value, offset, stepDuration, (e, val) =>
                    {
                        e.style.translate = new Translate(val, 0);
                    })
                    .Ease(Easing.Linear)
                    .OnCompleted(() =>
                    {
                        currentStep++;
                        AnimateStep();
                    });
            }

            AnimateStep();
        }

        #endregion

        #region Stagger Animations

        /// <summary>
        /// Animate multiple elements with staggered timing.
        /// </summary>
        public static void StaggerFadeIn(VisualElement[] elements, int staggerDelayMs = 50, int durationMs = DefaultDurationMs)
        {
            if (elements == null) return;

            for (int i = 0; i < elements.Length; i++)
            {
                var element = elements[i];
                if (element == null) continue;

                element.style.opacity = 0;
                element.style.display = DisplayStyle.Flex;

                // Schedule with delay
                int delay = i * staggerDelayMs;
                element.schedule.Execute(() => FadeIn(element, durationMs)).StartingIn(delay);
            }
        }

        /// <summary>
        /// Animate multiple elements sliding in with stagger.
        /// </summary>
        public static void StaggerSlideIn(VisualElement[] elements, int staggerDelayMs = 50, int durationMs = DefaultDurationMs)
        {
            if (elements == null) return;

            for (int i = 0; i < elements.Length; i++)
            {
                var element = elements[i];
                if (element == null) continue;

                element.style.opacity = 0;
                element.style.translate = new Translate(0, 20);
                element.style.display = DisplayStyle.Flex;

                int delay = i * staggerDelayMs;
                element.schedule.Execute(() => SlideInFromBottom(element, 20, durationMs)).StartingIn(delay);
            }
        }

        #endregion

        #region Utility Methods

        /// <summary>
        /// Show element instantly without animation.
        /// </summary>
        public static void ShowInstant(VisualElement element)
        {
            if (element == null) return;
            element.style.display = DisplayStyle.Flex;
            element.style.opacity = 1;
            element.style.scale = new Scale(Vector3.one);
            element.style.translate = new Translate(0, 0);
        }

        /// <summary>
        /// Hide element instantly without animation.
        /// </summary>
        public static void HideInstant(VisualElement element)
        {
            if (element == null) return;
            element.style.display = DisplayStyle.None;
        }

        /// <summary>
        /// Toggle visibility with animation.
        /// </summary>
        public static void ToggleVisibility(VisualElement element, bool visible, int durationMs = DefaultDurationMs)
        {
            if (visible)
                FadeIn(element, durationMs);
            else
                FadeOut(element, durationMs);
        }

        #endregion
    }
}
