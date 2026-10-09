import type { Concept } from "@fsl/shared";

export const domainDns: Concept = {
  id: "domain-dns",
  slug: "domain-dns",
  title: "Domains and DNS",
  topicId: "deployment",
  summary:
    "Giving your hosted app a name like notes.example.com and using DNS records to point that name at the server that runs it.",
  basics: [
    "Every computer on the internet has a numeric address called an IP address, such as `203.0.113.10`. Browsers need that number to connect, but people cannot remember numbers for every site.",
    "A domain name is the human-friendly name, like `example.com`. A subdomain is a name in front of it, like `notes.example.com`, which you can create freely once you own `example.com`.",
    'DNS, the Domain Name System, is the internet\'s phone book: a worldwide system of servers that answers the question "which address belongs to this name?".',
  ],
  what: [
    "A domain is a name you rent yearly from a registrar, a company allowed to sell names. Owning it lets you decide what it points to.",
    'DNS records are the entries you create for your domain. An `A` record maps a name directly to an IPv4 address; a `CNAME` record says "this name is an alias for that other name", for example `notes.example.com` → `my-notes.onrender.com`, and DNS follows it to the final address.',
  ],
  why: [
    "Hosts give you a working but awkward default address. Your own domain is easier to remember, looks trustworthy, and stays the same even if you move to another host — you just change the record.",
    "HTTPS certificates are issued for names, not for IP addresses. To get the padlock in the browser and encrypt traffic, your app needs a domain the certificate can be issued for.",
  ],
  howItWorks: [
    "You buy a domain at a registrar. The registrar records which DNS servers (nameservers) are in charge of it — usually the registrar's own, or those of a DNS provider you choose.",
    "In your host's dashboard you add your custom domain. The host tells you which record to create: typically a `CNAME` for a subdomain like `notes.example.com`, or an `A` record with an IP address for the bare domain `example.com`.",
    "You create that record in the DNS provider's dashboard. When a browser asks for `notes.example.com`, the lookup follows the chain to your nameservers, gets the record, and connects to your host.",
    "Once the host sees the record pointing at it, it requests an HTTPS certificate for the name — usually free from Let's Encrypt — and installs and renews it automatically.",
  ],
  basicExample: {
    language: "bash",
    code: `$ dig notes.example.com +short
my-notes.onrender.com.
203.0.113.10

$ nslookup notes.example.com
Non-authoritative answer:
notes.example.com  canonical name = my-notes.onrender.com.
Name:    my-notes.onrender.com
Address: 203.0.113.10`,
    caption:
      "Looking up a name: it is a CNAME alias for the host's name, which in turn resolves to an IP address. Addresses shown are examples.",
  },
  internals: [
    "Your computer first asks a resolver, usually run by your internet provider or a public service. If the resolver does not know the answer, it asks the root servers, which point to the servers for `.com`, which point to your domain's nameservers, which finally return your record.",
    "Every answer has a TTL, time to live, in seconds. Resolvers keep (cache) answers for that long. That is why a changed record can take minutes to hours to be seen everywhere — this delay is called propagation. Lowering the TTL a day before a planned change makes the switch faster.",
    "A `CNAME` cannot be used on the bare domain (`example.com`) according to the DNS rules, because that name also needs other records. Hosts work around this with an `A` record to a fixed IP, or with provider features often called ALIAS or flattening.",
    "To issue a certificate, Let's Encrypt checks that you control the name, for example by requesting a special file from it over HTTP. Because DNS already points to your host, the host can answer that challenge itself — which is why HTTPS is usually automatic once DNS is right.",
  ],
  howToCreate: [
    {
      text: "Look up an existing domain to see DNS in action. Both tools come with macOS and Linux; on Windows use `nslookup`.",
      code: {
        language: "bash",
        code: `nslookup github.com
dig github.com +short
dig www.github.com +short`,
      },
    },
    {
      text: "Deploy your app on a host, then in its dashboard add a custom domain such as `notes.yourdomain.com`. Write down the record it asks for.",
    },
    {
      text: "At your registrar or DNS provider, create the record. For a subdomain this is usually a `CNAME`; the host's documentation tells you the exact target.",
      code: {
        language: "bash",
        code: `Type:   CNAME
Name:   notes
Target: my-notes.onrender.com
TTL:    300`,
      },
    },
    {
      text: "Check it worked: run `dig notes.yourdomain.com +short` until it shows the host's name. Then wait for the host to show the certificate as issued, and open `https://notes.yourdomain.com/api/health` — the page loads with a padlock in the address bar.",
    },
  ],
  whereUsed: [
    "Every public website and API — from `github.com` to your portfolio.",
    "Splitting one domain into parts with subdomains, such as `www.example.com` for the website, `api.example.com` for an API or `docs.example.com` for documentation.",
    "Email settings, which also live in DNS (`MX` and `TXT` records), so take care not to delete records you did not create.",
  ],
  connectsTo: [
    "Hosting: the record points at the host, and the host must know about the domain to accept its traffic.",
    "HTTPS: the certificate is issued for the domain name.",
    "How the web works: a DNS lookup is the very first step before a browser can send any HTTP request.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App is deployed under one domain in build step 14: one DNS record points that name at the host, the host provides the HTTPS certificate, and the backend serves the API under `/api` on that same name, so the frontend and API share one origin.",
    },
    {
      explanation:
        "This learning platform is planned to run on Render. Until a custom domain is added it would use Render's default address; adding one means only a new DNS record, with no code change.",
    },
  ],
  commonMistakes: [
    "Expecting a DNS change to work instantly. Old answers stay cached until their TTL runs out; check with `dig` and wait instead of changing records again and again.",
    "Putting `https://` or a path into a record's target. DNS knows only names and addresses: the target is `my-notes.onrender.com`, nothing more.",
    "Pointing the domain at the host but forgetting to add it in the host's dashboard. The host then does not know the name, rejects the traffic and cannot issue a certificate.",
    "Letting the domain registration expire. The site disappears and someone else can buy the name; turn on auto-renew.",
  ],
  relatedConcepts: [
    "how-the-web-works",
    "hosting",
    "deploying-a-full-stack-app",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
