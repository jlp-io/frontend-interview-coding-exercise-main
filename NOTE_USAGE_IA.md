# # Note d'usage de l'IA / AI usage report

## 1. Quels outils avez-vous utilisés, et pour quelles parties du travail ?

Un assistant de programmation fondé sur l’IA a aidé à interpréter le sujet fourni, à créer l’interface Next.js et l’API ASP.NET Core, à rédiger le document OpenAPI ainsi que les tests du backend et du navigateur. Yarn et le SDK .NET ont servi à installer les dépendances et à compiler l’application.

_English:_ An AI coding assistant helped interpret the supplied assignment, create the Next.js interface and ASP.NET Core API, write the OpenAPI document, and draft backend and browser tests. Yarn and the .NET SDK were used to install dependencies and compile the application.

## 2. Où l'IA s'est-elle trompée ?

- La première version traitait le sujet comme un calculateur de prêt immobilier générique et utilisait un taux saisi par l’utilisateur. La lecture du sujet a montré que le revenu détermine les deux taux et que le backend doit faire autorité. Les champs de saisie, l’API et la configuration ont été modifiés pour respecter cette règle.
- La première conception des calculs arrondissait les intérêts chaque mois. L’annexe A exige des calculs décimaux en pleine précision et un arrondi uniquement des valeurs affichées ou renvoyées. Le backend utilise désormais le type `decimal` et arrondit les valeurs renvoyées au centime.
- La première version ne comprenait pas d’API. Les exigences techniques imposaient une API et une définition OpenAPI ; les deux ont donc été ajoutées, ainsi qu’une validation côté serveur.
- Un premier test des limites de taux s’attendait à ce que 27 800,00 € corresponde à la tranche suivante. Le sujet en français définit les tranches comme étant ouvertes à leur borne inférieure et fermées à leur borne supérieure (sauf pour la première). L’échec du test a révélé cette attente erronée ; elle a été corrigée et complétée par un cas à 27 800,01 €.

_English:_

- The first pass treated the task as a generic mortgage calculator and used a user-entered rate. Reading the brief showed that income selects both rates and that the backend must be authoritative. The inputs, API, and configuration were changed to follow that rule.
- The first calculation design rounded interest each month. Annex A requires full-precision decimal calculations and rounding only displayed/returned values. The backend now uses `decimal` and rounds returned figures to cents.
- The first pass did not include an API. The technical requirements made the API and OpenAPI definition mandatory, so both were added along with server-side validation.
- An initial rate-boundary test expected €27,800.00 to select the next bracket. The French brief defines brackets as lower-exclusive and upper-inclusive (except the first); the failing test exposed the wrong expectation, which was corrected and supplemented with a €27,800.01 case.

## 3. Qu'avez-vous vérifié sans l'IA ?

Les PDF du sujet en français et en anglais ainsi que le fichier CSV de référence ont été examinés directement. Le cas de référence — 100 000 € / 360 mois / revenu de 28 000 € — a servi à vérifier la mensualité et chaque montant des 360 lignes du tableau d’amortissement. `yarn test:api` a réussi les 19 tests ; Coverlet a mesuré une couverture de lignes de 100 % pour la classe métier de calcul des prêts. `yarn build` s’est achevé avec succès pour l’API et le frontend. Une dernière relance des tests E2E n’a pas abouti, car l’API était inaccessible au démarrage de Playwright ; les deux scénarios de navigateur avaient réussi lors de la précédente revue.

_English:_ The French and English assignment PDFs and reference CSV were inspected directly. The €100,000 / 360-month / €28,000-income reference case was used to verify the monthly payment and every amount in all 360 schedule rows. `yarn test:api` passed 19 tests; Coverlet measured 100% line coverage for the loan-calculation business class. `yarn build` completed successfully for the API and frontend. A final E2E rerun did not complete because the API was unreachable during Playwright startup; both browser scenarios had passed in the prior review run.

## 4. Quels fichiers d'instructions avez-vous fournis à votre outil ?

Le PDF du sujet fourni ainsi que le README et les instructions du kit présents dans le dépôt ont été communiqués comme contexte de travail. Aucun fichier d’instructions personnalisé pour l’agent n’a été ajouté.

_English:_ The provided assignment PDF and repository README/kit instructions were supplied as task context. No custom agent instruction file was added.
