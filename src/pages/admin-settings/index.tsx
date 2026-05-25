import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SettingItem {
  key: string;
  value: string;
  type: "string" | "integer" | "boolean";
  label: string;
  description: string | null;
  is_public: boolean;
}

type SettingsData = Record<string, SettingItem[]>;

interface SettingsApiResponse {
  success: boolean;
  data: SettingsData;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  booking: "Booking",
  email: "Email",
  payment: "Payment",
  api: "API",
};

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({
  item,
  localValue,
  isDirty,
  isSaving,
  onChange,
  onSave,
  onToggle,
}: {
  item: SettingItem;
  localValue: string;
  isDirty: boolean;
  isSaving: boolean;
  onChange: (val: string) => void;
  onSave: () => void;
  onToggle: (checked: boolean) => void;
}) {
  const boolValue = localValue === "1" || localValue === "true";

  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">{item.label}</p>
          <Badge
            variant="outline"
            className={
              item.is_public
                ? "text-xs border-green-300 text-green-700"
                : "text-xs border-orange-300 text-orange-700"
            }
          >
            {item.is_public ? "public" : "private"}
          </Badge>
          {isDirty && (
            <Badge variant="secondary" className="text-xs">
              unsaved
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.key}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {item.type === "boolean" ? (
          <Switch
            checked={boolValue}
            onCheckedChange={onToggle}
            disabled={isSaving}
          />
        ) : (
          <>
            <Input
              className="w-52 text-sm"
              value={localValue}
              onChange={(e) => onChange(e.target.value)}
              type={item.type === "integer" ? "number" : "text"}
            />
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving || !isDirty}
              className="gap-1"
            >
              {isSaving ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Settings Tab (manages state for one category) ────────────────────────────
function SettingsTab({ items, categoryLabel }: { items: SettingItem[]; categoryLabel: string }) {
  const queryClient = useQueryClient();

  const [localValues, setLocalValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.key, item.value]))
  );

  useEffect(() => {
    setLocalValues(Object.fromEntries(items.map((item) => [item.key, item.value])));
  }, [items]);

  const dirtyKeys = items
    .filter((item) => localValues[item.key] !== item.value)
    .map((item) => item.key);

  // Single setting: PUT /admin/settings/{key}  { "value": "..." }
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const { mutate: saveOne } = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      makeApiRequest(`${apiUrl.updateAdminSetting}/${key}`, {
        method: "PUT",
        data: { value },
      }),
    onSuccess: (_res, { key }) => {
      toast.success(`${items.find((i) => i.key === key)?.label ?? key} updated`);
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (_err, { key }) =>
      toast.error(`Failed to update ${items.find((i) => i.key === key)?.label ?? key}`),
    onSettled: () => setSavingKey(null),
  });

  // Bulk save: PUT /admin/settings  { "settings": { key: value, ... } }
  const { mutate: saveAll, isPending: isSavingAll } = useMutation({
    mutationFn: (settings: Record<string, string>) =>
      makeApiRequest(apiUrl.updateAdminSetting, {
        method: "PUT",
        data: { settings },
      }),
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: () => toast.error("Failed to update settings"),
  });

  const handleSaveOne = (key: string) => {
    setSavingKey(key);
    saveOne({ key, value: localValues[key] });
  };

  const handleSaveAll = () => {
    const dirty = Object.fromEntries(dirtyKeys.map((k) => [k, localValues[k]]));
    saveAll(dirty);
  };

  const handleToggle = (key: string, checked: boolean) => {
    const value = checked ? "1" : "0";
    setLocalValues((prev) => ({ ...prev, [key]: value }));
    setSavingKey(key);
    saveOne({ key, value });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{categoryLabel} Settings</CardTitle>
          {dirtyKeys.length > 0 && (
            <Button
              size="sm"
              onClick={handleSaveAll}
              disabled={isSavingAll || savingKey !== null}
              className="gap-1"
            >
              {isSavingAll ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isSavingAll ? "Saving..." : `Save All Changes (${dirtyKeys.length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y px-6">
          {items.map((item) => (
            <SettingRow
              key={item.key}
              item={item}
              localValue={localValues[item.key] ?? item.value}
              isDirty={localValues[item.key] !== item.value}
              isSaving={savingKey === item.key || isSavingAll}
              onChange={(val) => setLocalValues((prev) => ({ ...prev, [item.key]: val }))}
              onSave={() => handleSaveOne(item.key)}
              onToggle={(checked) => handleToggle(item.key, checked)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
function AdminSettings() {
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => makeApiRequest<SettingsApiResponse>(apiUrl.getAdminSettings),
  });

  const groups = (data?.data as SettingsData | undefined) ?? {};
  const tabKeys = Object.keys(groups);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-7 w-7 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Admin application settings management</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-settings"] })}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loading skeleton */}
      {isFetching && tabKeys.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-80 rounded-md" />
          <Card>
            <CardContent className="space-y-6 pt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-9 w-52 rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : tabKeys.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            No settings found.
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={tabKeys[0]}>
          <TabsList className="mb-4">
            {tabKeys.map((key) => (
              <TabsTrigger key={key} value={key} className="capitalize">
                {CATEGORY_LABELS[key] ?? key}
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {groups[key].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabKeys.map((key) => (
            <TabsContent key={key} value={key}>
              <SettingsTab
                items={groups[key]}
                categoryLabel={CATEGORY_LABELS[key] ?? key}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

export default AdminSettings;
