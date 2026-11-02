import { describe, it, expect, vi, beforeEach } from "vitest";
import { userDataManager } from "./user-data-manager";
import { getCurrentAccount, postGalleryVideo } from "../users";

// The manager talks to the server through these. Fake them so only its own
// bookkeeping is tested. A server call takes a moment, like a real upload does,
// so that two saves can overlap.
vi.mock("../users", () => {
  const slowOk = () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 20));
  return {
    addUserMajor: vi.fn(slowOk),
    addUserSkill: vi.fn(slowOk),
    addUserSocial: vi.fn(slowOk),
    deleteUserMajor: vi.fn(slowOk),
    deleteUserSkill: vi.fn(slowOk),
    deleteUserSocial: vi.fn(slowOk),
    editUser: vi.fn(slowOk),
    getCurrentAccount: vi.fn(),
    updateProjectProfileVisibility: vi.fn(slowOk),
    updateUserSkill: vi.fn(slowOk),
    updateUserSocial: vi.fn(slowOk),
    updateTagExclusion: vi.fn(slowOk),
    deleteGalleryImage: vi.fn(slowOk),
    deleteGalleryVideo: vi.fn(slowOk),
    postGalleryImage: vi.fn(slowOk),
    postGalleryVideo: vi.fn(slowOk),
  };
});

const video = (localId: number) => ({
  id: { type: "local" as const, value: localId },
  data: { title: `video ${localId.toString()}`, videoUrl: "https://www.youtube.com/watch?v=abc" },
});

describe("userDataManager.saveChanges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentAccount).mockResolvedValue({
      status: 200,
      error: null,
      data: { userId: 1 },
    } as Awaited<ReturnType<typeof getCurrentAccount>>);
  });

  it("uploads each queued item once, even when saved twice at the same time", async () => {
    const manager = await userDataManager();
    manager.addGalleryVideo(video(1));
    manager.addGalleryVideo(video(2));

    // Save pressed twice before the first save has finished
    await Promise.all([manager.saveChanges(), manager.saveChanges()]);

    expect(postGalleryVideo).toHaveBeenCalledTimes(2);
  });

  it("uploads each queued item once, even when saved three times at the same time", async () => {
    const manager = await userDataManager();
    manager.addGalleryVideo(video(1));

    await Promise.all([manager.saveChanges(), manager.saveChanges(), manager.saveChanges()]);

    expect(postGalleryVideo).toHaveBeenCalledTimes(1);
  });

  it("sends nothing when there is nothing queued", async () => {
    const manager = await userDataManager();

    await manager.saveChanges();

    expect(postGalleryVideo).not.toHaveBeenCalled();
  });

  it("sends an item only once across saves one after the other", async () => {
    const manager = await userDataManager();
    manager.addGalleryVideo(video(1));

    await manager.saveChanges();
    await manager.saveChanges();

    expect(postGalleryVideo).toHaveBeenCalledTimes(1);
  });

  it("keeps changes made during a save for the next save", async () => {
    const manager = await userDataManager();
    manager.addGalleryVideo(video(1));

    const firstSave = manager.saveChanges();
    // the user adds another video while the first save is still uploading
    manager.addGalleryVideo(video(2));
    await firstSave;

    expect(postGalleryVideo).toHaveBeenCalledTimes(1);

    await manager.saveChanges();

    expect(postGalleryVideo).toHaveBeenCalledTimes(2);
    expect(vi.mocked(postGalleryVideo).mock.calls.map(([, data]) => data.title)).toStrictEqual([
      "video 1",
      "video 2",
    ]);
  });
});
