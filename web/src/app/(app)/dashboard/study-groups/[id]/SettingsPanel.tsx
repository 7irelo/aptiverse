"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useSnackbar } from "notistack";
import { Globe, Lock, Trash2 } from "lucide-react";
import { useUpdateStudyGroup, useDeleteStudyGroup } from "@/lib/api/queries";
import { useConfirm } from "@/components/common/ConfirmDialog";
import type { StudyGroup } from "@/lib/mockData";

export function SettingsPanel({ group }: { group: StudyGroup }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, dialog } = useConfirm();
  const update = useUpdateStudyGroup(group.id);
  const remove = useDeleteStudyGroup();

  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [privacy, setPrivacy] = useState<"open" | "invite">(group.privacy);
  const [capacity, setCapacity] = useState(group.memberCapacity);
  const [whoCanAdd, setWhoCanAdd] = useState<"everyone" | "admins">(group.tasksWhoCanAdd);
  const [notify, setNotify] = useState(group.notifyOnNewTask);
  const [autoSync, setAutoSync] = useState(group.autoSyncTasks);

  const dirty =
    name.trim() !== group.name ||
    description.trim() !== group.description ||
    privacy !== group.privacy ||
    capacity !== group.memberCapacity ||
    whoCanAdd !== group.tasksWhoCanAdd ||
    notify !== group.notifyOnNewTask ||
    autoSync !== group.autoSyncTasks;
  const belowHeadcount = capacity < group.members;

  const save = () => {
    if (name.trim().length < 2 || belowHeadcount) return;
    update.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        privacy,
        memberCapacity: capacity,
        tasksWhoCanAdd: whoCanAdd,
        notifyOnNewTask: notify,
        autoSyncTasks: autoSync,
      },
      {
        onSuccess: () => enqueueSnackbar("Group updated.", { variant: "success" }),
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't save.", { variant: "error" }),
      },
    );
  };

  const disband = async () => {
    const ok = await confirm({
      title: `Delete ${group.name}?`,
      description: "This removes the group, its shared tasks, and every scheduled session for everyone. It cannot be undone.",
      confirmLabel: "Delete group",
      tone: "danger",
    });
    if (!ok) return;
    remove.mutate(group.id, {
      onSuccess: () => {
        enqueueSnackbar("Group deleted.", { variant: "success" });
        router.push("/dashboard/study-groups");
      },
      onError: (err) =>
        enqueueSnackbar(err instanceof Error ? err.message : "Couldn't delete.", { variant: "error" }),
    });
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 520 }}>
      <TextField label="Group name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        size="small"
        multiline
        minRows={2}
      />

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Member limit
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {capacity} people
          </Typography>
        </Stack>
        <Slider
          value={capacity}
          onChange={(_, v) => setCapacity(v as number)}
          min={2}
          max={50}
          step={1}
          color="secondary"
          marks={[
            { value: 2, label: "2" },
            { value: 50, label: "50" },
          ]}
        />
        {belowHeadcount && (
          <Typography variant="caption" color="error.main">
            The group already has {group.members} members. Remove some before shrinking below that.
          </Typography>
        )}
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
          Who can join
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={privacy}
          onChange={(_, v) => v && setPrivacy(v)}
          fullWidth
          sx={{ maxWidth: 320 }}
        >
          <ToggleButton value="open">
            <Globe size={16} style={{ marginRight: 6 }} />
            Open
          </ToggleButton>
          <ToggleButton value="invite">
            <Lock size={16} style={{ marginRight: 6 }} />
            Invite only
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Task preferences
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
            Who can add a shared task
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={whoCanAdd}
            onChange={(_, v) => v && setWhoCanAdd(v)}
            fullWidth
            sx={{ maxWidth: 320 }}
          >
            <ToggleButton value="everyone">Any member</ToggleButton>
            <ToggleButton value="admins">Admins only</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <FormControlLabel
          control={<Switch checked={notify} onChange={(e) => setNotify(e.target.checked)} color="secondary" />}
          label="Notify the group when a task is added"
        />
        <FormControlLabel
          control={<Switch checked={autoSync} onChange={(e) => setAutoSync(e.target.checked)} color="secondary" />}
          label="Put dated tasks on every member's calendar automatically"
        />
      </Box>

      <Button
        onClick={save}
        variant="contained"
        color="secondary"
        disabled={!dirty || name.trim().length < 2 || belowHeadcount || update.isPending}
        sx={{ alignSelf: "flex-start" }}
      >
        {update.isPending ? "Saving" : "Save changes"}
      </Button>

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Delete this group
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Disband the group entirely. Its chat and sessions go with it.
        </Typography>
        <Button
          onClick={disband}
          variant="outlined"
          color="error"
          startIcon={<Trash2 size={16} />}
          disabled={remove.isPending}
        >
          Delete group
        </Button>
      </Box>
      {dialog}
    </Stack>
  );
}
