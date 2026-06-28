<template>
  <div class="my-page-wrapper">
    <section class="profile-block">
      <div class="profile-main">
        <nut-avatar
          size="64"
          bg-color="var(--card-color)"
          :url="icon"
          class="auto-reverse"
        />
        <div class="profile-text">
          <p class="title">{{ appName }}</p>
          <p class="des">{{ t("myPage.profile.desc") }}</p>
        </div>
      </div>
      <div class="status-grid">
        <div class="status-item">
          <span>{{ t("myPage.profile.runtime") }}</span>
          <strong>{{ env.runtime || env.backend || "Cloudflare Workers" }}</strong>
        </div>
        <div class="status-item">
          <span>{{ t("myPage.profile.storage") }}</span>
          <strong>{{ env.storage || "D1" }}</strong>
        </div>
        <div class="status-item">
          <span>{{ t("myPage.profile.version") }}</span>
          <strong>v{{ env.version || "-" }}</strong>
        </div>
      </div>
    </section>

    <section class="config-card storage-card">
      <div class="title-wrapper">
        <h1>{{ t("myPage.backup.title") }}</h1>
        <div class="storage-actions">
          <input ref="fileInput" type="file" accept="application/json,.json" @change="restoreFromFile" />
          <nut-button plain type="primary" size="small" :loading="restoreIsLoading" @click="selectBackupFile">
            <font-awesome-icon v-if="!restoreIsLoading" icon="fa-solid fa-cloud-arrow-up" />
            {{ t("myPage.backup.restore") }}
          </nut-button>
          <a :href="backupUrl" target="_blank" rel="noreferrer">
            <nut-button type="primary" size="small">
              <font-awesome-icon icon="fa-solid fa-cloud-arrow-down" />
              {{ t("myPage.backup.export") }}
            </nut-button>
          </a>
        </div>
      </div>
      <p class="card-desc">{{ t("myPage.backup.desc") }}</p>
    </section>

    <section class="config-card">
      <div class="title-wrapper">
        <h1>{{ t("myPage.templates.title") }}</h1>
        <div class="storage-actions">
          <input ref="templateFileInput" type="file" accept="application/json,.json,.yaml,.yml,text/yaml" @change="importTemplateFromFile" />
          <nut-button plain type="primary" size="small" :loading="templateImporting" @click="selectTemplateFile">
            <font-awesome-icon v-if="!templateImporting" icon="fa-solid fa-file-import" />
            {{ t("myPage.templates.importFile") }}
          </nut-button>
          <nut-button type="primary" size="small" :loading="templateImporting" @click="openTemplateImport">
            <font-awesome-icon v-if="!templateImporting" icon="fa-solid fa-plus" />
            {{ t("myPage.templates.create") }}
          </nut-button>
        </div>
      </div>
      <div class="template-list">
        <div v-for="template in templates" :key="template.name" class="template-item">
          <div class="template-text">
            <span class="template-title">{{ template.displayName || template.name }}</span>
            <span class="template-meta">
              {{ template.readonly ? t("myPage.templates.builtIn") : t("myPage.templates.custom") }}
              · {{ getTargetLabel(template.target || "mihomo") }}
            </span>
          </div>
          <div class="template-actions">
            <nut-button v-if="!template.readonly" plain type="primary" size="mini" @click="openTemplateEdit(template)">
              {{ t("myPage.btn.edit") }}
            </nut-button>
            <nut-button v-if="!template.readonly" plain type="danger" size="mini" @click="deleteCustomTemplate(template.name)">
              {{ t("myPage.btn.delete") }}
            </nut-button>
          </div>
        </div>
      </div>
    </section>

    <section class="config-card">
      <div class="title-wrapper" @click="requestEditing ? cancelRequestEdit() : startRequestEdit()">
        <h1>{{ t("myPage.request.title") }}</h1>
        <div class="config-btn-wrapper">
          <template v-if="requestEditing">
            <nut-button class="cancel-btn" plain type="info" size="mini" :disabled="requestSaving" @click.stop="cancelRequestEdit">
              <font-awesome-icon icon="fa-solid fa-ban" />
              {{ t("myPage.btn.cancel") }}
            </nut-button>
            <nut-button class="save-btn" type="primary" size="mini" :loading="requestSaving" @click.stop="saveRequestSettings">
              <font-awesome-icon v-if="!requestSaving" icon="fa-solid fa-floppy-disk" />
              {{ t("myPage.btn.save") }}
            </nut-button>
          </template>
          <nut-icon v-else class="right-icon" name="right"></nut-icon>
        </div>
      </div>
      <div v-if="requestEditing" class="config-input-wrapper">
        <nut-input class="input" v-model="requestForm.defaultUserAgent" :placeholder="t('myPage.request.defaultUserAgent')" type="text" input-align="left" />
        <nut-input class="input" v-model="requestForm.defaultFlowUserAgent" :placeholder="t('myPage.request.defaultFlowUserAgent')" type="text" input-align="left" />
        <nut-input class="input" v-model="requestForm.defaultTimeout" :placeholder="t('myPage.request.defaultTimeout')" type="number" input-align="left" />
        <nut-input class="input" v-model="requestForm.backendRequestConcurrency" :placeholder="t('myPage.request.backendRequestConcurrency')" type="number" input-align="left" />
        <nut-input class="input" v-model="requestForm.backendRequestConcurrencyWaitTime" :placeholder="t('myPage.request.backendRequestConcurrencyWaitTime')" type="number" input-align="left" />
      </div>
      <p v-else class="card-desc">{{ requestSummary }}</p>
    </section>

    <section class="config-card">
      <div class="title-wrapper">
        <h1>{{ t("myPage.appearance.title") }}</h1>
        <LanguageSwitcherButton />
      </div>
      <div class="settings-row">
        <div>
          <p class="row-title">{{ t("myPage.appearance.simpleMode") }}</p>
          <p class="row-desc">{{ t("myPage.appearance.simpleModeDesc") }}</p>
        </div>
        <nut-switch v-model="simpleMode" @change="saveAppearance" />
      </div>
      <div class="settings-row">
        <div>
          <p class="row-title">{{ t("myPage.appearance.wideScreenNarrowMode") }}</p>
          <p class="row-desc">{{ t("myPage.appearance.wideScreenNarrowModeDesc") }}</p>
        </div>
        <nut-switch v-model="wideScreenNarrowMode" @change="saveAppearance" />
      </div>
    </section>

    <nut-popup v-model:visible="templateImportVisible" position="bottom" round closeable :style="{ height: '82vh' }">
      <div class="template-import-panel">
        <h2>{{ templateEditingId ? t("myPage.templates.editTitle") : t("myPage.templates.importTitle") }}</h2>
        <nut-input class="input" v-model.trim="templateForm.id" :placeholder="t('myPage.templates.idPlaceholder')" input-align="left" :disabled="Boolean(templateEditingId)" />
        <nut-input class="input" v-model.trim="templateForm.name" :placeholder="t('myPage.templates.namePlaceholder')" input-align="left" />
        <nut-cell class="template-target-trigger" @click="openTemplateTargetPicker">
          <view class="nut-cell__title">{{ t("myPage.templates.target") }}</view>
          <view class="nut-cell__value">
            <nut-input
              :model-value="templateTargetLabel"
              :border="false"
              readonly
              input-align="right"
              right-icon="rect-right"
              @click-right-icon.stop="openTemplateTargetPicker"
            />
          </view>
        </nut-cell>
        <div class="template-content-editor">
          <cmView :is-read-only="false" id="TemplateEditor" />
        </div>
        <nut-button block type="primary" :loading="templateImporting" @click="saveTemplate">
          {{ t("myPage.templates.save") }}
        </nut-button>
      </div>
    </nut-popup>
    <DesktopPicker
      v-model="selectedTemplateTargetValue"
      v-model:visible="templateTargetPickerVisible"
      :columns="templateTargetColumns"
      :title="t('myPage.templates.targetPickerTitle')"
      :cancel-text="t('myPage.btn.cancel')"
      :ok-text="t('specificWord.confirm')"
      @confirm="handleTemplateTargetConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Dialog } from "@nutui/nutui";
import { useI18n } from "vue-i18n";

import { useCloudflareApi } from "@/api/app";
import LanguageSwitcherButton from "@/components/LanguageSwitcherButton.vue";
import DesktopPicker from "@/components/DesktopPicker.vue";
import { useSettingsApi } from "@/api/settings";
import { useBackend } from "@/hooks/useBackend";
import { useAppNotifyStore } from "@/store/appNotify";
import { useCodeStore } from "@/store/codeStore";
import { useSettingsStore } from "@/store/settings";
import cmView from "@/views/editCode/cmView.vue";
import { TEMPLATE_TARGET_OPTIONS, getTargetLabel } from "@/constants/subscriptionTargets";

const settingsStore = useSettingsStore();
const settingsApi = useSettingsApi();
const cloudflareApi = useCloudflareApi();
const cmStore = useCodeStore();
const { showNotify } = useAppNotifyStore();
const { t } = useI18n();
const { appearanceSetting } = storeToRefs(settingsStore);
const { icon, env } = useBackend();
const TEMPLATE_EDITOR_ID = "TemplateEditor";

const fileInput = ref<HTMLInputElement | null>(null);
const templateFileInput = ref<HTMLInputElement | null>(null);
const restoreIsLoading = ref(false);
const requestEditing = ref(false);
const requestSaving = ref(false);
const templateImporting = ref(false);
const templateImportVisible = ref(false);
const templateEditingId = ref("");
const templateTargetPickerVisible = ref(false);
const templates = ref<any[]>([]);
const simpleMode = ref(Boolean(appearanceSetting.value.isSimpleMode));
const wideScreenNarrowMode = ref(Boolean(appearanceSetting.value.useNarrowModeOnWideScreen));

const requestForm = reactive({
  defaultUserAgent: "",
  defaultFlowUserAgent: "",
  defaultTimeout: "",
  backendRequestConcurrency: "",
  backendRequestConcurrencyWaitTime: "",
});
const templateForm = reactive({
  id: "",
  name: "",
  target: "mihomo",
});
const selectedTemplateTargetValue = ref<string[]>([]);
const templateTargetColumns = computed(() => {
  return TEMPLATE_TARGET_OPTIONS.map((option) => ({
    text: option.label,
    value: option.value,
  }));
});
const templateTargetLabel = computed(() => {
  return getTargetLabel(templateForm.target);
});
const appName = computed(() => {
  return env.value?.app
    || env.value?.meta?.cloudflare?.env?.SUB_STORE_BACKEND_CUSTOM_NAME
    || "Sub-Store Cloudflare";
});
const requestSummary = computed(() => {
  return t("myPage.request.summary", {
    concurrency: settingsStore.backendRequestConcurrency || "3",
    timeout: settingsStore.defaultTimeout || "30000",
  });
});

const backupUrl = computed(() => {
  const url = new URL("/api/storage", window.location.origin);
  const token = localStorage.getItem("substore_admin_token");
  if (token) url.searchParams.set("token", token);
  return url.toString();
});

watch(
  () => appearanceSetting.value,
  (next) => {
    simpleMode.value = Boolean(next.isSimpleMode);
    wideScreenNarrowMode.value = Boolean(next.useNarrowModeOnWideScreen);
  },
  { deep: true },
);

const syncRequestForm = () => {
  requestForm.defaultUserAgent = settingsStore.defaultUserAgent || "";
  requestForm.defaultFlowUserAgent = settingsStore.defaultFlowUserAgent || "";
  requestForm.defaultTimeout = settingsStore.defaultTimeout || "";
  requestForm.backendRequestConcurrency = settingsStore.backendRequestConcurrency || "";
  requestForm.backendRequestConcurrencyWaitTime = settingsStore.backendRequestConcurrencyWaitTime || "";
};

const startRequestEdit = () => {
  syncRequestForm();
  requestEditing.value = true;
};

const cancelRequestEdit = () => {
  syncRequestForm();
  requestEditing.value = false;
};

const saveRequestSettings = async () => {
  requestSaving.value = true;
  try {
    const saved = await settingsStore.changeSettings({ ...requestForm });
    requestEditing.value = !saved;
  } finally {
    requestSaving.value = false;
  }
};

const saveAppearance = async () => {
  await settingsStore.changeAppearanceSetting({
    appearanceSetting: {
      ...appearanceSetting.value,
      isSimpleMode: simpleMode.value,
      useNarrowModeOnWideScreen: wideScreenNarrowMode.value,
    },
  });
};

const selectBackupFile = () => {
  fileInput.value?.click();
};

const fetchTemplates = async () => {
  const res = await cloudflareApi.getTemplates();
  if (res?.data?.status === "success" && Array.isArray(res.data.data)) {
    templates.value = res.data.data;
  }
};

const selectTemplateFile = () => {
  templateFileInput.value?.click();
};

const openTemplateImport = () => {
  templateEditingId.value = "";
  templateForm.id = "";
  templateForm.name = "";
  templateForm.target = "mihomo";
  cmStore.setEditCode(TEMPLATE_EDITOR_ID, "");
  templateImportVisible.value = true;
};

const openTemplateEdit = (template: any) => {
  templateEditingId.value = template.name;
  templateForm.id = template.name;
  templateForm.name = template.displayName || template.name;
  templateForm.target = template.target || "mihomo";
  cmStore.setEditCode(TEMPLATE_EDITOR_ID, JSON.stringify(template.config || {}, null, 2));
  templateImportVisible.value = true;
};

const importTemplateFromFile = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = "";
  if (!file) return;

  templateEditingId.value = "";
  templateForm.id = file.name.replace(/\.(json|ya?ml)$/i, "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  templateForm.name = file.name.replace(/\.(json|ya?ml)$/i, "");
  templateForm.target = "mihomo";
  cmStore.setEditCode(TEMPLATE_EDITOR_ID, await file.text());
  templateImportVisible.value = true;
};

const openTemplateTargetPicker = () => {
  selectedTemplateTargetValue.value = [templateForm.target || "mihomo"];
  templateTargetPickerVisible.value = true;
};

const handleTemplateTargetConfirm = ({ selectedValue }) => {
  templateForm.target = selectedValue?.[0] || "mihomo";
  selectedTemplateTargetValue.value = [templateForm.target];
  templateTargetPickerVisible.value = false;
};

const saveTemplate = async () => {
  const content = String(cmStore.EditCode[TEMPLATE_EDITOR_ID] || "");
  if (!templateForm.id || !content.trim()) {
    showNotify({ type: "danger", title: t("myPage.templates.validationRequired") });
    return;
  }

  templateImporting.value = true;
  try {
    const payload = {
      id: templateForm.id,
      name: templateForm.name || templateForm.id,
      target: templateForm.target,
      content,
    };
    const res = templateEditingId.value
      ? await cloudflareApi.updateTemplate(templateEditingId.value, payload)
      : await cloudflareApi.createTemplate(payload);
    if (res?.data?.status !== "success") throw new Error("import failed");
    await fetchTemplates();
    templateImportVisible.value = false;
    templateEditingId.value = "";
    showNotify({ type: "success", title: t("myPage.templates.saveSucceed") });
  } catch (error) {
    showNotify({ type: "danger", title: t("myPage.templates.saveFailed", { e: errorMessage(error) }) });
  } finally {
    templateImporting.value = false;
  }
};

const deleteCustomTemplate = (name: string) => {
  Dialog({
    title: t("myPage.templates.deleteTitle"),
    content: t("myPage.templates.deleteContent", { name }),
    popClass: "auto-dialog",
    okText: t("myPage.btn.delete"),
    cancelText: t("myPage.btn.cancel"),
    closeOnClickOverlay: true,
    onOk: async () => {
      const res = await cloudflareApi.deleteTemplate(name);
      if (res?.data?.status === "success") {
        await fetchTemplates();
        showNotify({ type: "success", title: t("myPage.templates.deleteSucceed") });
      }
    },
  });
};

const restoreFromFile = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = "";
  if (!file) return;

  Dialog({
    title: t("myPage.backup.restoreTitle"),
    content: t("myPage.backup.restoreContent"),
    popClass: "auto-dialog",
    okText: t("myPage.backup.restore"),
    cancelText: t("myPage.btn.cancel"),
    closeOnClickOverlay: true,
    onOk: async () => {
      restoreIsLoading.value = true;
      try {
        const content = await file.text();
        const res = await settingsApi.restoreSettings({ content });
        if (res?.data?.status !== "success") throw new Error("restore failed");
        await settingsStore.fetchSettings();
        showNotify({ type: "success", title: t("myPage.notify.restore.succeed") });
      } catch (error) {
        showNotify({ type: "danger", title: t("myPage.notify.restore.failedWithError", { e: errorMessage(error) }) });
      } finally {
        restoreIsLoading.value = false;
      }
    },
  });
};

const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

onMounted(fetchTemplates);
</script>

<style lang="scss" scoped>
.my-page-wrapper {
  width: calc(100% - 1.5rem);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-block,
.config-card {
  border-radius: var(--item-card-radios);
  background: var(--card-color);
  color: var(--second-text-color);
  overflow: hidden;
}

.profile-block {
  padding: 18px;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-text {
  min-width: 0;

  .title {
    margin: 0;
    font-size: 18px;
    line-height: 1.35;
    color: var(--primary-text-color);
  }

  .des {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--comment-text-color);
  }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.status-item {
  min-width: 0;
  padding: 10px;
  border-radius: var(--item-card-radios);
  background: var(--background-color);

  span,
  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 12px;
    color: var(--comment-text-color);
  }

  strong {
    margin-top: 4px;
    font-size: 13px;
    color: var(--primary-text-color);
  }
}

.title-wrapper {
  min-height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--divider-color);
  cursor: pointer;

  h1 {
    margin: 0;
    font-size: 15px;
    color: var(--primary-text-color);
  }
}

.storage-card .title-wrapper {
  cursor: default;
}

.storage-actions,
.config-btn-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    display: none;
  }
}

.card-desc {
  margin: 0;
  padding: 12px 16px 16px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--comment-text-color);
}

.template-list {
  display: flex;
  flex-direction: column;
}

.template-item {
  min-height: 54px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--divider-color);

  &:last-child {
    border-bottom: 0;
  }
}

.template-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-title,
.template-meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-title {
  font-size: 14px;
  color: var(--primary-text-color);
}

.template-meta {
  font-size: 12px;
  color: var(--comment-text-color);
}

.template-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.template-import-panel {
  height: 100%;
  padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--second-text-color);

  h2 {
    margin: 0 0 4px;
    font-size: 17px;
    color: var(--primary-text-color);
  }
}

.template-target-trigger {
  box-shadow: none;
  border-radius: var(--item-card-radios);
  background: var(--background-color);
}

.template-content-editor {
  flex: 1;
  min-height: 220px;
  border: 1px solid var(--divider-color);
  border-radius: var(--item-card-radios);
  background: var(--background-color);
  overflow: auto;

  :deep(.cmviewRef) {
    min-height: 220px;
  }

  :deep(.cm-editor) {
    min-height: 220px;
  }
}

.config-input-wrapper {
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .input {
    border-bottom: 1px solid var(--divider-color);
  }
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--divider-color);

  &:last-child {
    border-bottom: 0;
  }
}

.row-title {
  margin: 0;
  font-size: 14px;
  color: var(--primary-text-color);
}

.row-desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--comment-text-color);
}

@media screen and (max-width: 430px) {
  .status-grid {
    grid-template-columns: 1fr;
  }

  .title-wrapper {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px 16px;
  }
}
</style>
