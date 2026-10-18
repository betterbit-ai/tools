/** A 5-page PDF becomes a ZIP with 5 JPGs. */
export default async function (t) {
  await t.open('/pdf-to-jpg');
  await t.upload(await t.pdf({ pages: 5 }));
  await t.waitForText(/5 pages?/);
  const zip = await t.download(() => t.click('Download ZIP'));
  const entries = zip.bytes.toString('latin1').split('PK\x03\x04').length - 1;
  t.assert(entries === 5, `expected 5 files in the ZIP, found ${entries}`);
}
