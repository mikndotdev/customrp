"use client";

import { saveSettings } from "@/actions/settings";
import { ActivityType } from "@/actions/activityManager";
import {
  DiscordRichPresence,
  ActivityType as ComponentActivityType,
} from "@/components/RichPresence";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  enabled: boolean;
  name: string | null;
  platform: string | null;
  type: string | null;
  details: string | null;
  state: string | null;
  largeImage: string | null;
  smallImage: string | null;
  smallText: string | null;
  btn1Text: string | null;
  btn1Url: string | null;
  btn2Text: string | null;
  btn2Url: string | null;
};

export default function SettingsForm({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(user.enabled);
  const [name, setName] = useState(user.name || "");
  const [platform, setPlatform] = useState(user.platform || "desktop");
  const [type, setType] = useState(
    user.type
      ? ActivityType[user.type as keyof typeof ActivityType]
      : ActivityType.Playing,
  );
  const [state, setState] = useState(user.state || "");
  const [details, setDetails] = useState(user.details || "");
  const [largeImage, setLargeImage] = useState(user.largeImage || "");
  const [smallImage, setSmallImage] = useState(user.smallImage || "");
  const [smallText, setSmallText] = useState(user.smallText || "");
  const [btn1Text, setBtn1Text] = useState(user.btn1Text || "");
  const [btn1Url, setBtn1Url] = useState(user.btn1Url || "");
  const [btn2Text, setBtn2Text] = useState(user.btn2Text || "");
  const [btn2Url, setBtn2Url] = useState(user.btn2Url || "");

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await saveSettings(formData);
      if (result.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Enable/Disable Switch */}
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text font-semibold">Enable Rich Presence</span>
          <input
            type="checkbox"
            name="enabled"
            className="toggle toggle-primary"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
        </label>
      </div>

      <div className="divider"></div>

      {/* Activity Name */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Activity Name *</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="e.g., Visual Studio Code"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Platform */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Platform</span>
        </label>
        <select
          name="platform"
          className="select select-bordered w-full"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="desktop">Desktop</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
        </select>
      </div>

      {/* Activity Type */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Activity Type *</span>
        </label>
        <select
          name="type"
          className="select select-bordered w-full"
          value={type}
          onChange={(e) =>
            setType(Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5)
          }
          required
        >
          <option value={ActivityType.Playing}>Playing</option>
          <option value={ActivityType.Streaming}>Streaming</option>
          <option value={ActivityType.Listening}>Listening</option>
          <option value={ActivityType.Watching}>Watching</option>
          <option value={ActivityType.Custom}>Custom</option>
          <option value={ActivityType.Competing}>Competing</option>
        </select>
      </div>

      {/* State */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">State</span>
        </label>
        <input
          type="text"
          name="state"
          placeholder="e.g., Working on a project"
          className="input input-bordered w-full"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
      </div>

      {/* Details */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Details</span>
        </label>
        <input
          type="text"
          name="details"
          placeholder="e.g., Editing src/index.ts"
          className="input input-bordered w-full"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div className="divider">Images</div>

      {/* Large Image */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Large Image URL</span>
        </label>
        <input
          type="url"
          name="largeImage"
          placeholder="https://example.com/image.png"
          className="input input-bordered w-full"
          value={largeImage}
          onChange={(e) => setLargeImage(e.target.value)}
        />
      </div>

      {/* Small Image */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Small Image URL</span>
        </label>
        <input
          type="url"
          name="smallImage"
          placeholder="https://example.com/icon.png"
          className="input input-bordered w-full"
          value={smallImage}
          onChange={(e) => setSmallImage(e.target.value)}
        />
      </div>

      {/* Small Text */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Small Image Text</span>
        </label>
        <input
          type="text"
          name="smallText"
          placeholder="Hover text for small image"
          className="input input-bordered w-full"
          value={smallText}
          onChange={(e) => setSmallText(e.target.value)}
        />
      </div>

      <div className="divider">Buttons</div>

      {/* Button 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Button 1 Text</span>
          </label>
          <input
            type="text"
            name="btn1Text"
            placeholder="e.g., Visit Website"
            className="input input-bordered w-full"
            value={btn1Text}
            onChange={(e) => setBtn1Text(e.target.value)}
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Button 1 URL</span>
          </label>
          <input
            type="url"
            name="btn1Url"
            placeholder="https://example.com"
            className="input input-bordered w-full"
            value={btn1Url}
            onChange={(e) => setBtn1Url(e.target.value)}
          />
        </div>
      </div>

      {/* Button 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Button 2 Text</span>
          </label>
          <input
            type="text"
            name="btn2Text"
            placeholder="e.g., GitHub"
            className="input input-bordered w-full"
            value={btn2Text}
            onChange={(e) => setBtn2Text(e.target.value)}
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Button 2 URL</span>
          </label>
          <input
            type="url"
            name="btn2Url"
            placeholder="https://github.com"
            className="input input-bordered w-full"
            value={btn2Url}
            onChange={(e) => setBtn2Url(e.target.value)}
          />
        </div>
      </div>

      <div className="divider">Preview</div>

      {/* Rich Presence Preview */}
      <div className="mt-6 flex justify-center">
        <DiscordRichPresence
          activityType={type}
          title={name}
          details={details}
          state={state}
          largeImageKey={largeImage}
          smallImageKey={smallImage}
          button1Text={btn1Text}
          button1Url={btn1Url}
          button2Text={btn2Text}
          button2Url={btn2Url}
        />
      </div>

      {/* Save Button */}
      <div className="form-control mt-6">
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="loading loading-spinner"></span>
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </form>
  );
}
