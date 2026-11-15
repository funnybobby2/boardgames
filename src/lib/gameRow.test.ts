import { describe, expect, it } from "vitest"
import { toGame, toRow } from "./gameRow"

const row = {
  id: 7,
  title: "Onirim",
  group: "",
  nb_user_min: 1,
  nb_user_max: 2,
  duration: 15,
  age_min: 10,
  is_played: true,
  category: ["Coopératif"],
  resume: "<p>Solo</p>",
  rule_video_url: "",
  img: "7.webp",
  note: 6,
  is_extension: false,
  for_sale: true,
}

describe("toGame / toRow", () => {
  it("maps a database row to a Game", () => {
    expect(toGame(row)).toMatchObject({ id: 7, nbUserMin: 1, ageMin: 10, isPlayed: true, forSale: true, ruleVideoUrl: "" })
  })

  it("defaults a null category to an empty array", () => {
    expect(toGame({ ...row, category: null }).category).toEqual([])
  })

  it("round-trips every column except id", () => {
    const expected: Record<string, unknown> = { ...row }
    delete expected.id
    expect(toRow(toGame(row))).toEqual(expected)
  })

  it("only writes the fields present in a partial patch", () => {
    expect(toRow({ note: 9, isPlayed: undefined })).toEqual({ note: 9 })
  })
})
