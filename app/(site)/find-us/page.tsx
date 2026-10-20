import type { Metadata } from "next";
import Link from "next/link";
import { inn, practicalities } from "@/lib/inn";

export const metadata: Metadata = {
  title: "Finding us",
  description:
    "Directions to Larkspur House at Underley, near Kirkby Lonsdale in Cumbria — by car, by train and on foot — plus telephone, email and the practical details.",
};

export default function FindUsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label">Finding us</p>
          <h1 className="display-xl mt-4 max-w-2xl">
            The lane ends
            <br />
            at the gate.
          </h1>
        </div>
        <div className="lg:col-span-5 lg:pt-12">
          <p className="lede">
            Underley, half a mile outside Kirkby Lonsdale, between the church and the river.
            There is no signpost — there never has been — but you will know the house when you
            see it.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="border-y border-ink py-5">
            <p className="label">The address</p>
            <address className="mt-2 font-display text-2xl leading-tight not-italic">
              {inn.address.line1}
              <br />
              {inn.address.line2}
              <br />
              {inn.address.town}, {inn.address.county}
              <br />
              {inn.address.postcode}
            </address>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[10px] uppercase tracking-[0.16em] text-muted">Telephone</dt>
                <dd>
                  <a href={`tel:${inn.phoneHref}`} className="underline underline-offset-4">
                    {inn.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[10px] uppercase tracking-[0.16em] text-muted">Email</dt>
                <dd>
                  <a href={`mailto:${inn.email}`} className="underline underline-offset-4">
                    {inn.email}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[10px] uppercase tracking-[0.16em] text-muted">What3words</dt>
                <dd className="text-ink-soft">///kettles.mossy.orchard</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 space-y-6">
            <Direction
              title="By car"
              body="Leave the M6 at junction 36 and take the A65 east towards Kirkby Lonsdale. At the second roundabout, take the B6254 signed for Underley and the church. After half a mile, look for a stone gatepost and a green lane on the left, immediately after the white cottage. There is parking for eight cars in the yard; the gate is open from eight in the morning."
            />
            <Direction
              title="By train"
              body="Oxenholme (the Lake District) is forty minutes away and Kendal forty-five. Taxis are usually waiting at Oxenholme; if not, ring the inn and we will fetch you for the cost of the fuel. There is a bus from Kirkby Lonsdale on market days."
            />
            <Direction
              title="On foot"
              body="The Dales Way passes the top of the lane, and the fell path from Underley is a good hour from the village. Walkers are welcome to leave boots in the porch and bags in the hall before check-in."
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <Map />
          <p className="caption mt-2">
            A hand-drawn approximation. The lanes are older than the map and not to scale.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="border border-line bg-parchment p-4">
              <p className="label">Good to know</p>
              <ul className="mt-2 space-y-1.5 text-[12.5px] text-ink-soft">
                <li>Check-in from {inn.checkIn}, check-out by {inn.checkOut}.</li>
                <li>Supper at {inn.supper}; breakfast {inn.breakfast}.</li>
                <li>Late arrival? A note and the porch light are left out.</li>
                <li>Two electric car chargers behind the barn.</li>
              </ul>
            </div>
            <div className="border border-line bg-parchment p-4">
              <p className="label">Getting in touch</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                The telephone is answered from seven in the morning until ten at night. If we
                miss you, we were probably in the garden — leave a message and we will ring back.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                <a href={`tel:${inn.phoneHref}`} className="link-arrow">
                  Call the inn
                </a>
                <Link href="/stay" className="link-arrow">
                  Request a stay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-20">
        <div className="grid gap-8 border-t border-ink pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {practicalities.map((item) => (
            <div key={item.title}>
              <h2 className="font-display text-lg">{item.title}</h2>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Direction({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-line pt-4">
      <h2 className="font-display text-lg">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

function Map() {
  return (
    <div className="relative overflow-hidden border border-line bg-[#f1ebdc]">
      <svg viewBox="0 0 800 560" className="h-auto w-full" role="img" aria-labelledby="map-title map-desc">
        <title id="map-title">A hand-drawn map of the lanes around Larkspur House</title>
        <desc id="map-desc">
          Larkspur House sits on a lane half a mile west of Kirkby Lonsdale, between the church of
          St Mary and the River Lune, north of the A65 and east of the M6 junction 36.
        </desc>

        <rect width="800" height="560" fill="#f1ebdc" />
        {/* fields */}
        <path d="M0 60 L210 20 L300 120 L180 210 L0 230 Z" fill="#e2e6d2" opacity="0.85" />
        <path d="M300 120 L540 70 L640 190 L520 280 L330 250 Z" fill="#dde3cb" opacity="0.7" />
        <path d="M640 200 L800 160 L800 330 L620 340 Z" fill="#e6e9d5" opacity="0.8" />
        <path d="M80 330 L260 300 L360 400 L240 520 L40 500 Z" fill="#e4e7d1" opacity="0.75" />
        <path d="M400 330 L600 310 L700 430 L560 540 L400 500 Z" fill="#dfe4cc" opacity="0.8" />
        {/* wooded copse */}
        <g opacity="0.55" fill="#9aa98a">
          <circle cx="470" cy="160" r="13" />
          <circle cx="490" cy="150" r="10" />
          <circle cx="505" cy="164" r="12" />
          <circle cx="486" cy="172" r="9" />
          <circle cx="300" cy="420" r="11" />
          <circle cx="318" cy="430" r="8" />
          <circle cx="288" cy="434" r="8" />
        </g>
        {/* river */}
        <path
          d="M760 20 C 700 90, 720 140, 660 190 C 610 230, 620 280, 570 320 C 520 360, 540 420, 470 470 C 420 505, 400 530, 360 560"
          fill="none"
          stroke="#a8bdb8"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M760 20 C 700 90, 720 140, 660 190 C 610 230, 620 280, 570 320 C 520 360, 540 420, 470 470 C 420 505, 400 530, 360 560"
          fill="none"
          stroke="#8fa6a3"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
        />
        <text x="700" y="120" fill="#6f8884" fontSize="11" fontStyle="italic" fontFamily="Georgia, serif" transform="rotate(-48 700 120)">
          the Lune
        </text>

        {/* A65 */}
        <path d="M0 470 C 180 440, 340 430, 520 440 C 640 447, 720 460, 800 470" fill="none" stroke="#d8c9a9" strokeWidth="16" />
        <path d="M0 470 C 180 440, 340 430, 520 440 C 640 447, 720 460, 800 470" fill="none" stroke="#c9b58f" strokeWidth="1.4" strokeDasharray="8 10" />
        <text x="620" y="492" fill="#8a7c5f" fontSize="11" letterSpacing="1.5" fontFamily="Helvetica, Arial, sans-serif">
          A65 · KENDAL → KIRKBY LONSDALE
        </text>

        {/* lane to the inn */}
        <path d="M300 460 C 280 400, 250 360, 214 330 C 190 310, 178 288, 176 258" fill="none" stroke="#cbbda1" strokeWidth="7" strokeLinecap="round" />
        <path d="M176 258 C 172 230, 150 214, 118 204" fill="none" stroke="#cbbda1" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 9" />
        <text x="212" y="372" fill="#8a7c5f" fontSize="10.5" fontStyle="italic" fontFamily="Georgia, serif" transform="rotate(-68 212 372)">
          the green lane
        </text>

        {/* village */}
        <g>
          <rect x="560" y="360" width="18" height="14" fill="#d7c8ad" stroke="#b7a482" />
          <rect x="586" y="372" width="22" height="14" fill="#d7c8ad" stroke="#b7a482" />
          <rect x="572" y="392" width="16" height="12" fill="#d7c8ad" stroke="#b7a482" />
          <rect x="610" y="352" width="14" height="20" fill="#d7c8ad" stroke="#b7a482" />
          <rect x="544" y="410" width="20" height="12" fill="#d7c8ad" stroke="#b7a482" />
          <text x="548" y="345" fill="#6a6350" fontSize="12" letterSpacing="2" fontFamily="Helvetica, Arial, sans-serif">
            KIRKBY LONSDALE
          </text>
        </g>

        {/* church */}
        <g transform="translate(300 250)">
          <path d="M0 26 l0 -16 l9 0 l0 -10 l6 0 l0 10 l9 0 l0 16 z" fill="#cfbfa0" stroke="#a89570" />
          <path d="M4 0 l5 -12 l5 12 z" fill="#b8a37c" />
          <text x="34" y="18" fill="#6a6350" fontSize="10.5" fontStyle="italic" fontFamily="Georgia, serif">
            St Mary’s
          </text>
        </g>

        {/* the inn */}
        <g transform="translate(150 208)">
          <circle r="26" fill="#a9552f" opacity="0.12" />
          <circle r="17" fill="#a9552f" opacity="0.18" />
          <circle r="7" fill="#a9552f" />
          <circle r="11" fill="none" stroke="#a9552f" strokeWidth="1.2" />
          <rect x="-26" y="-54" width="118" height="30" fill="#f7f2e8" stroke="#d8cdb7" />
          <text x="-18" y="-35" fill="#1c2620" fontSize="13" fontFamily="Georgia, serif">
            Larkspur House
          </text>
        </g>

        {/* fell */}
        <path d="M40 120 C 80 70, 120 96, 150 60 C 180 30, 220 60, 250 34" fill="none" stroke="#9aa98a" strokeWidth="2" strokeDasharray="4 6" />
        <text x="58" y="104" fill="#77856b" fontSize="11" fontStyle="italic" fontFamily="Georgia, serif">
          the fell
        </text>

        {/* M6 */}
        <path d="M120 560 C 130 460, 110 380, 90 300 C 74 230, 80 140, 60 20" fill="none" stroke="#c2b8a3" strokeWidth="9" />
        <text x="42" y="392" fill="#8a7c5f" fontSize="10.5" letterSpacing="2" fontFamily="Helvetica, Arial, sans-serif" transform="rotate(-80 42 392)">
          M6 · J36
        </text>

        {/* compass */}
        <g transform="translate(742 500)" fill="#6a6350">
          <circle r="17" fill="none" stroke="#b7a482" />
          <path d="M0 -12 L4 4 L0 1 L-4 4 Z" fill="#a9552f" />
          <text x="-3.5" y="-22" fontSize="10" fontFamily="Helvetica, Arial, sans-serif">N</text>
        </g>

        {/* footnote */}
        <text x="40" y="30" fill="#8a7c5f" fontSize="10" letterSpacing="3" fontFamily="Helvetica, Arial, sans-serif">
          UNDERLEY · CUMBRIA
        </text>
      </svg>
    </div>
  );
}
