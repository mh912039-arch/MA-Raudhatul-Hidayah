import { test } from "node:test";
import assert from "node:assert/strict";
import {
  registrationSchema,
  validateDocument,
  documentError,
  mapsSchema,
  verifySchema,
} from "../lib/validation.ts";
const good = {
  student_name: "Siswa Pengujian",
  nisn: "0123456789",
  birth_date: "2011-03-12",
  gender: "Perempuan",
  previous_school: "SMP Pengujian",
  parent_name: "Wali Pengujian",
  parent_phone: "081234567890",
  email: "test@example.com",
  address: "Jalan Pengujian Nomor 123",
  consent: true,
  request_id: crypto.randomUUID(),
  access_token: "a".repeat(64),
  website: "",
};
test("valid registration and rejection of malformed identities", () => {
  assert.equal(registrationSchema.safeParse(good).success, true);
  for (const bad of [
    { nisn: "123" },
    { consent: false },
    { birth_date: "2011-02-30" },
    { email: "invalid" },
    { website: "spam" },
    { parent_phone: "abc" },
    { student_name: "A" },
  ])
    assert.equal(
      registrationSchema.safeParse({ ...good, ...bad }).success,
      false,
    );
});
test("file size, MIME and real signature checks", async () => {
  const pdf = new File(["%PDF-1.4\n test"], "rapor.pdf", {
    type: "application/pdf",
  });
  assert.equal(await validateDocument(pdf), "pdf");
  await assert.rejects(
    validateDocument(
      new File(["not a PDF"], "fake.pdf", { type: "application/pdf" }),
    ),
    /Isi berkas/,
  );
  assert.match(
    documentError(
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.pdf", {
        type: "application/pdf",
      }),
    )!,
    /5 MB/,
  );
  assert.match(
    documentError(new File(["x"], "script.svg", { type: "image/svg+xml" }))!,
    /PDF/,
  );
});
test("maps origin validation and mandatory rejection notes", () => {
  assert.equal(
    mapsSchema.safeParse("https://www.google.com/maps?q=Bandung&output=embed")
      .success,
    true,
  );
  assert.equal(
    mapsSchema.safeParse("https://google.com.attacker.test/maps").success,
    false,
  );
  assert.equal(
    verifySchema.safeParse({
      id: crypto.randomUUID(),
      status: "Ditolak",
      notes: "",
      updated_at: new Date().toISOString(),
    }).success,
    false,
  );
});
