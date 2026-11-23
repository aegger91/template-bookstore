import type { ComponentType } from "react";
import type { ResolvedRoute } from "@/lib/routing";
import { CartSection } from "./cart";
import { CatalogBrowser } from "./catalog-browser";
import { CheckoutSection } from "./checkout";
import { PageHeader, ProductShelf, RichText, type SectionProps, VisitStrip } from "./common";
import { AccountSection, ContactForm, WholesaleForm, WishlistSection } from "./forms";
import { BlessingNote, CategoryGrid, EventsPreview, FeastCollection, Hero, JournalPreview, SaintShelf } from "./home";
import { AuthorsList, EventsList, FaqSection, JournalList, PostArticle, PostProducts, PublishersList, VisitInfo, WholesaleTiers } from "./misc";
import { ProductDetail, RelatedProducts } from "./product";

/** Section types that can be placed on any page from content/pages.json. */
const sections: Record<string, ComponentType<SectionProps>> = {
  hero: Hero,
  feastCollection: FeastCollection,
  categoryGrid: CategoryGrid,
  saintShelf: SaintShelf,
  blessingNote: BlessingNote,
  eventsPreview: EventsPreview,
  journalPreview: JournalPreview,
  visitStrip: VisitStrip,
  pageHeader: PageHeader,
  richText: RichText,
  productShelf: ProductShelf,
  catalogBrowser: () => <CatalogBrowser />,
  cart: () => <CartSection />,
  checkout: () => <CheckoutSection />,
  account: () => <AccountSection />,
  wishlist: () => <WishlistSection />,
  wholesaleTiers: WholesaleTiers,
  wholesaleForm: () => <WholesaleForm />,
  publishersList: PublishersList,
  authorsList: AuthorsList,
  eventsList: EventsList,
  journalList: JournalList,
  visitInfo: VisitInfo,
  contactForm: () => <ContactForm />,
  faq: FaqSection,
};

export const sectionTypes = [...Object.keys(sections), "productDetail", "relatedProducts", "postArticle", "postProducts"];

export function RenderSections({ lang, route }: { lang: string; route: ResolvedRoute }) {
  return (
    <>
      {route.sections
        .filter((s) => s.enabled !== false)
        .map((section, i) => {
          const key = `${section.type}-${i}`;
          const props = { section, lang };
          if (route.kind === "category" && section.type === "catalogBrowser") return <CatalogBrowser key={key} categoryId={route.category.id} />;
          if (route.kind === "product") {
            if (section.type === "productDetail") return <ProductDetail key={key} {...props} product={route.product} />;
            if (section.type === "relatedProducts") return <RelatedProducts key={key} {...props} product={route.product} />;
          }
          if (route.kind === "post") {
            if (section.type === "postArticle") return <PostArticle key={key} {...props} post={route.post} />;
            if (section.type === "postProducts") return <PostProducts key={key} {...props} post={route.post} />;
          }
          const Section = sections[section.type];
          return Section ? <Section key={key} {...props} /> : null;
        })}
    </>
  );
}
