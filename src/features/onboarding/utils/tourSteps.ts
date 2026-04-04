import type { DriveStep } from "driver.js";

type TranslationFunction = (key: string) => string;

export function getUploadTourSteps(t: TranslationFunction): DriveStep[] {
  return [
    {
      element: '[data-tour="upload-header"]',
      popover: {
        title: t("upload.step1.title"),
        description: t("upload.step1.description"),
        side: "bottom",
        align: "start"
      }
    },
    {
      element: '[data-tour="upload-dropzone"]',
      popover: {
        title: t("upload.step2.title"),
        description: t("upload.step2.description"),
        side: "bottom",
        align: "center"
      }
    },
    {
      element: '[data-tour="upload-alternatives"]',
      popover: {
        title: t("upload.step3.title"),
        description: t("upload.step3.description"),
        side: "top",
        align: "center"
      }
    },
    {
      element: '[data-tour="upload-stepper"]',
      popover: {
        title: t("upload.step4.title"),
        description: t("upload.step4.description"),
        side: "bottom",
        align: "center"
      }
    }
  ];
}

export function getResumeBuilderTourSteps(t: TranslationFunction): DriveStep[] {
  return [
    {
      element: '[data-tour="rb-main"]',
      popover: {
        title: t("resumeBuilder.step1.title"),
        description: t("resumeBuilder.step1.description"),
        side: "left",
        align: "start"
      }
    },
    {
      element: '[data-tour="rb-header"]',
      popover: {
        title: t("resumeBuilder.step2.title"),
        description: t("resumeBuilder.step2.description"),
        side: "bottom",
        align: "start"
      }
    },
    {
      element: '[data-tour="rb-tab-content"]',
      popover: {
        title: t("resumeBuilder.step3.title"),
        description: t("resumeBuilder.step3.description"),
        side: "bottom",
        align: "center"
      }
    },
    {
      element: '[data-tour="rb-tab-design"]',
      popover: {
        title: t("resumeBuilder.step4.title"),
        description: t("resumeBuilder.step4.description"),
        side: "bottom",
        align: "center"
      }
    },
    {
      element: '[data-tour="rb-tab-export"]',
      popover: {
        title: t("resumeBuilder.step5.title"),
        description: t("resumeBuilder.step5.description"),
        side: "bottom",
        align: "center"
      }
    },
    {
      element: '[data-tour="rb-preview"]',
      popover: {
        title: t("resumeBuilder.step6.title"),
        description: t("resumeBuilder.step6.description"),
        side: "left",
        align: "center"
      }
    }
  ];
}

export function getApiKeysTourSteps(t: TranslationFunction): DriveStep[] {
  return [
    {
      element: '[data-tour="api-header"]',
      popover: {
        title: t("apiKeys.step1.title"),
        description: t("apiKeys.step1.description"),
        side: "bottom",
        align: "start"
      }
    },
    {
      element: '[data-tour="api-generate"]',
      popover: {
        title: t("apiKeys.step2.title"),
        description: t("apiKeys.step2.description"),
        side: "bottom",
        align: "end"
      }
    },
    {
      element: '[data-tour="api-keys-list"]',
      popover: {
        title: t("apiKeys.step3.title"),
        description: t("apiKeys.step3.description"),
        side: "top",
        align: "center"
      }
    }
  ];
}

export function getDashboardTourSteps(t: TranslationFunction): DriveStep[] {
  return [
    {
      element: '[data-tour="sidebar-nav"]',
      popover: {
        title: t("dashboard.step1.title"),
        description: t("dashboard.step1.description"),
        side: "right",
        align: "start"
      }
    }
  ];
}
